import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import b64toBlob from  'b64-to-blob';
import JSZip from 'jszip';

const modelData = require('url-loader!@/../web_model/model.zip');

export default {
  load : async () => {
    let zip = await new JSZip().loadAsync(modelData.split(',')[1], {base64: true});
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
