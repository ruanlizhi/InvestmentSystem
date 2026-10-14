import snapshot from './public-snapshot.json';
import {validateState,type State} from './model';
export function publicState():State {const state=structuredClone(snapshot);validateState(state);return state;}
