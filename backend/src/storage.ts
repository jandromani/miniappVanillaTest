import fs from "fs";
import path from "path";

const DATA_PATH = path.join(__dirname, "..", "data", "state.json");

type PersistedState = {
  payments?: any[];
  tournaments?: any[];
  suspiciousAnswers?: any[];
  prizePoolSnapshots?: any[];
  merkleRecords?: any[];
};

const ensureDir = () => {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const loadState = (): PersistedState => {
  try {
    if (!fs.existsSync(DATA_PATH)) return {};
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.warn("Failed to load persisted state", error);
    return {};
  }
};

export const saveState = (state: PersistedState) => {
  try {
    ensureDir();
    const tmpPath = `${DATA_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2));
    fs.renameSync(tmpPath, DATA_PATH);
  } catch (error) {
    console.warn("Failed to save state", error);
  }
};

export const updateState = (partial: PersistedState) => {
  const current = loadState();
  const merged = { ...current, ...partial } as PersistedState;
  saveState(merged);
  return merged;
};
