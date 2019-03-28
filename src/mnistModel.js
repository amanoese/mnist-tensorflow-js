import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import axios from 'axios';
import b64toBlob from  'b64-to-blob';
import JSZip from 'jszip';

export default {
  load : async () => {
    let { data:modelData } = await axios.get('/web_model/model.zip',{responseType:'blob'})
    let zip = await new JSZip().loadAsync(modelData);
    let sortedZipFiles = [
      ...zip.filter((path,file)=>/model.json/.test(path)),
      ...zip.filter((path,file)=>!/model.json/.test(path))];

    let fileNames    = sortedZipFiles.map(zipObj=>zipObj.name)
    let arraybuffers = await Promise.all(sortedZipFiles.map(zipObj=>zipObj.async("arraybuffer")))

    let modelFiles = _.zip(fileNames,arraybuffers)
      .map(([name,arraybuffer])=> new File([arraybuffer],name));

    return tf.loadGraphModel(tf.io.browserFiles(modelFiles))
  }
}
