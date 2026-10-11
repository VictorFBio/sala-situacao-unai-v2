import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { verifyPanelBundle } from '../scripts/verify-panel-bundle.mjs';

test('verificação do pacote distingue importação dinâmica de gráficos antecipados por dependência compartilhada', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'panel-bundle-'));
  try {
    await mkdir(path.join(directory,'assets'));
    await writeFile(path.join(directory,'index.html'), '<script type="module" src="./assets/index.js"></script>');
    await writeFile(path.join(directory,'assets/index.js'), 'import {runtime} from "./vendor-react.js";const view=()=>import("./APSView.js");');
    await writeFile(path.join(directory,'assets/vendor-react.js'), 'export const runtime = {};');
    const result = await verifyPanelBundle(directory);
    assert.equal(result.initialScripts.length,2);
    await writeFile(path.join(directory,'assets/vendor-react.js'), 'import {runtime} from "./vendor-charts.js";export {runtime};');
    await assert.rejects(verifyPanelBundle(directory), /gráficos carregados antecipadamente.*vendor-charts/);
  } finally { await rm(directory,{recursive:true,force:true}); }
});
