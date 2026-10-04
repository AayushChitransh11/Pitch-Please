import {DatabaseSync} from 'node:sqlite';
import {serialize,deserialize} from 'node:v8';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
// Local durable storage. Keep this directory private and out of version control.
export function openStore(path) {
  mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (bucket TEXT NOT NULL, id TEXT NOT NULL, value BLOB NOT NULL, PRIMARY KEY(bucket,id))');
  const put=db.prepare('INSERT INTO records(bucket,id,value) VALUES (?,?,?) ON CONFLICT(bucket,id) DO UPDATE SET value=excluded.value');
  const remove=db.prepare('DELETE FROM records WHERE bucket=? AND id=?');
  class StoredMap extends Map {
    constructor(bucket) {
      super();this.bucket=bucket;
      for(const row of db.prepare('SELECT id,value FROM records WHERE bucket=?').all(bucket)) {
        const value=deserialize(Buffer.from(row.value));if(bucket==='sessions')value.busy=false;
        super.set(row.id,value);
      }
    }
    set(id,value){put.run(this.bucket,id,serialize(value));return super.set(id,value);}
    delete(id){remove.run(this.bucket,id);return super.delete(id);}
  }
  return {sessions:new StoredMap('sessions'),practices:new StoredMap('practices'),close:()=>db.close()};
}
