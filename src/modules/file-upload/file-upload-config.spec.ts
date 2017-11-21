import {FileUploadConfig} from './file-upload-config';

describe('FileUploadConfig', () => {

  it('should provide sensible defaults', () => {
    const config = new FileUploadConfig();
    expect(config.resumableUploadEnabled).toEqual(true);
    expect(config.defaultPartSize).toEqual(8 * 1000000);
    expect(config.totalSizeParamName).toEqual('_total_size');
    expect(config.partNumberParamName).toEqual('_part_number');
    expect(config.partSizeParamName).toEqual('_part_size');
    expect(config.currentPartSizeParamName).toEqual('_current_part_size');
    expect(config.fileParamName).toEqual('file');
  });
});
