import * as vscode from 'vscode';
import * as semver from 'semver';
import {API, GitExtension, Ref, Repository} from './git';
import {Octokit} from '@octokit/rest';

function getGitExtensionAPI(): API {
   return (<GitExtension>(
      vscode.extensions.getExtension('vscode.git')!.exports
   )).getAPI(1);
}

export async function getBranches(repository: vscode.Uri): Promise<Ref[]> {
   const gitAPI = getGitExtensionAPI();
   const repo = gitAPI.getRepository(repository);
   if (repo === null) {
      throw Error('Repo is null');
   }

   return await repo.getBranches({
      remote: true
   });
}

export async function getRemotes(repository: vscode.Uri): Promise<Ref[]> {
   const gitAPI = getGitExtensionAPI();
   const repo = gitAPI.getRepository(repository);
   if (repo === null) {
      throw Error('Repo is null');
   }

   return await repo.getBranches({
      remote: true
   });
}

export async function setGitHubRepoSecret(
   owner: string,
   repo: string,
   secret: string,
   value: string
) {
   let session: vscode.AuthenticationSession | undefined;
   try {
      await vscode.authentication
         .getSession('github', ['repo', 'read:public_key'], {
            createIfNone: true
         })
         .then(
            async (s) => {
               session = s;
            },
            (e) => {
               throw new Error(
                  'error getting github authentication session: ' + e
               );
            }
         );
   } catch (e) {
      throw new Error('Error getting github authentication session: ' + e);
   }

   if (session === undefined) {
      throw new Error('Failed to get GitHub authentication session');
      return;
   }
   const octokit = new Octokit({
      auth: session.accessToken
   });
   try {
      const ghActionPublicKeyResponse = await octokit.actions.getRepoPublicKey({
         owner,
         repo
      });
      const ghActionPublicKey = ghActionPublicKeyResponse.data;
      if (!ghActionPublicKey.key_id) {
         vscode.window.showErrorMessage(
            'Failed to get GitHub Action public key'
         );
         return;
      }
      const res = await octokit.actions.createOrUpdateRepoSecret({
         owner,
         repo,
         secret_name: secret,
         encrypted_value: Buffer.from(value).toString('base64'),
         key_id: ghActionPublicKey.key_id.toString()
      });
   } catch (e) {
      throw new Error('Error setting repo secret: ' + e);
   }
}
