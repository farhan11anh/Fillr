import { extractContextLabel } from './utils/fieldUtils';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`
<div class="row">
  <div class="col-4">
    <b>ID Pasien</b>
  </div>
  <div class="col-8">
    <div class="q-field">
      <input type="text" />
    </div>
  </div>
</div>
`);
const field = dom.window.document.querySelector('.q-field');
console.log("Label is:", extractContextLabel(field));
