import {ESLint} from 'eslint';
import {
   DraftLanguage,
   getDraftLanguages
} from '../../../commands/runDraftTool/helper/languages';
import * as assert from 'assert';
import {Errorable, getAsyncResult, Succeeded} from '../../../utils/errorable';

suite('Languages Test Suite', () => {
   test('languages are retrieve from draft info without error', async () => {
      const languages = await getAsyncResult(getDraftLanguages());

      assert.doesNotThrow(getDraftLanguages);
      assert(languages.length > 0);
   });

   test('each retrieved language contains a version', async () => {
      const languages = await getAsyncResult(getDraftLanguages());

      languages.forEach((lang: DraftLanguage) => {
         assert(lang.versions.length > 0);
      });
   });
});
