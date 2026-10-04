import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, extname} from 'node:path';
import {pathToFileURL} from 'node:url';
const exec = promisify(execFile);
const supported = new Set(['.pdf','.doc','.docx','.ppt','.pptx','.txt']);
const fail = (status, message) => {throw Object.assign(new Error(message),{status});};
export async function toPresentationPdf(bytes, filename='presentation.pdf', {binary=process.env.LIBREOFFICE_BIN || 'soffice'}={}) {
  const ext=extname(filename).toLowerCase();
  if (!supported.has(ext)) fail(415,'Upload a PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), or text (.txt) file.');
  if (!Buffer.isBuffer(bytes) || !bytes.length) fail(400,'The uploaded file is empty.');
  if (bytes.length>10*1024*1024) fail(413,'Files must be 10 MB or smaller.');
  if(ext==='.pdf') {
    if(bytes.subarray(0,5).toString()!=='%PDF-') fail(422,'This file is not a valid PDF.');
    return bytes;
  }
  if(['.docx','.pptx'].includes(ext) && bytes.subarray(0,2).toString()!=='PK') fail(422,'This Office file is not valid. Check its format and upload again.');
  const dir=await mkdtemp(join(tmpdir(),'pitch-convert-'));
  try {
    const profile=join(dir,'profile');await mkdir(join(profile,'user'),{recursive:true});
    // A fresh profile disables macros and automatic linked-content updates.
    await writeFile(join(profile,'user','registrymodifications.xcu'),'<?xml version="1.0"?><oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item><item oor:path="/org.openoffice.Office.Writer/Content/Update"><prop oor:name="Link" oor:op="fuse"><value>2</value></prop></item></oor:items>');
    const input=join(dir,`presentation${ext}`);await writeFile(input,bytes);
    await exec(binary,[`-env:UserInstallation=${pathToFileURL(profile).href}`,'--headless','--nologo','--nodefault','--norestore','--convert-to',ext.startsWith('.ppt') ? 'pdf:impress_pdf_Export' : 'pdf:writer_pdf_Export','--outdir',dir,input],{timeout:60000,maxBuffer:1024*1024,env:{...process.env,SAL_USE_VCLPLUGIN:'svp',XDG_CACHE_HOME:join(dir,'cache'),XDG_CONFIG_HOME:join(dir,'config'),...(process.platform==='darwin'?{TMPDIR:'/private/tmp'}:{})}});
    const pdf=await readFile(join(dir,'presentation.pdf'));
    if(pdf.subarray(0,5).toString()!=='%PDF-') fail(422,'Document conversion did not produce a PDF.');
    if(pdf.length>25*1024*1024) fail(413,'Converted document is too large. Try a smaller file.');
    return pdf;
  } catch(error) {
    if(error.status)throw error;
    if(error.code==='ENOENT' && error.path===binary)fail(503,'Word and PowerPoint conversion needs LibreOffice on the backend. Set LIBREOFFICE_BIN, then restart the backend.');
    if(error.killed)fail(422,'Document conversion timed out. Try a smaller or simpler file.');
    fail(422,'Could not convert this document. Check that it opens correctly and is not password-protected.');
  } finally {await rm(dir,{recursive:true,force:true});}
}
