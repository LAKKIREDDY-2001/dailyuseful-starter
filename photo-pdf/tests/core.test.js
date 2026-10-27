import test from 'node:test';
import assert from 'node:assert/strict';
import { tools, supportedTools } from '../src/data/tools.js';
import { fitImageDimensions, heightForAspect, parsePageOrder, parsePageRanges, safeDownloadName } from '../src/utils/files.js';
import { actualReduction } from '../src/utils/imageTools.js';

test('catalog has a dedicated route for all 45 requested tools', () => {
  assert.equal(tools.length, 45);
  assert.equal(new Set(tools.map((tool) => tool.path)).size, 45);
  for (const tool of tools) assert.match(tool.path, /^\/tools\/[a-z0-9-]+$/);
  for (const id of supportedTools) assert.ok(tools.some((tool) => tool.id === id));
});

test('page ranges parse single pages and ranges as zero-based indices', () => {
  assert.deepEqual(parsePageRanges('1-3, 5', 6), [[0, 1, 2], [4]]);
  assert.deepEqual(parsePageOrder('3, 1, 2', 3), [2, 0, 1]);
  assert.throws(() => parsePageRanges('1, 1', 3), /more than once/);
  assert.throws(() => parsePageRanges('2-1', 3), /must be between/);
  assert.throws(() => parsePageOrder('1, 3', 3), /List all 3 pages/);
});

test('aspect calculations preserve the exact 16:4 output dimensions', () => {
  assert.equal(heightForAspect(1600, 16, 4), 400);
  assert.throws(() => heightForAspect(1600, 0, 4), /positive numbers/);
});

test('frame modes compute contain, crop, and stretch layouts', () => {
  const fit = fitImageDimensions(800, 600, 1600, 400, 'fit');
  assert.equal(Math.round(fit.width), 533);
  assert.equal(fit.height, 400);
  assert.equal(Math.round(fit.x), 533);
  assert.equal(fit.y, 0);
  const fill = fitImageDimensions(800, 600, 1600, 400, 'fill');
  assert.deepEqual(fill, { width: 1600, height: 1200, x: 0, y: -400 });
  assert.deepEqual(fitImageDimensions(800, 600, 1600, 400, 'stretch'), { width: 1600, height: 400, x: 0, y: 0 });
});

test('image reduction is measured and may be negative', () => {
  assert.equal(actualReduction(1000, 700), 30);
  assert.equal(actualReduction(1000, 1300), -30);
  assert.equal(actualReduction(0, 100), 0);
});

test('download rename keeps the original extension and sanitizes unsafe characters', () => {
  assert.equal(safeDownloadName('holiday photo', 'original.jpg'), 'holiday photo.jpg');
  assert.equal(safeDownloadName('new-name.PNG', 'original.png'), 'new-name.png');
  assert.equal(safeDownloadName('../private', 'original.pdf'), '-private.pdf');
  assert.equal(safeDownloadName('', 'original.pdf'), 'original.pdf');
});
