const _Runtime = require('../../engine/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const Buffer = require('buffer').Buffer;

/**
 * Icon svg to be displayed in the blocks category menu, encoded as a data URI.
 * @type {string}
 */
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4K' +
  'PHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9' +
  'Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+' +
  'CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29t' +
  'L3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVudTwvdGl0bGU+CiAgICA8ZGVz' +
  'Yz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJFeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVu' +
  'dSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAg' +
  'ICAgPGcgaWQ9ImNsb3VkLXVwbG9hZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDUuMDAwMDAwKSIgZmlsbC1y' +
  'dWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjMDA3Q0ZGIiBvcGFjaXR5PSIw' +
  'LjMiIGN4PSIxMCIgY3k9IjEwIiByPSI4Ij48L2NpcmNsZT4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlLUNvcHki' +
  'IGZpbGw9IiMwMDdDRkYiIG9wYWNpdHk9IjAuNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjYiPjwvY2lyY2xlPgogICAgICAgICAg' +
  'ICA8cGF0aCBpZD0iVXBsb2FkLUFycm93IiBkPSJNMTAsNiBMMTAsMTQgTTYsMTAgTDEwLDYgTDE0LDEwIiBzdHJva2U9IiMw' +
  'MDdDRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBm' +
  'aWxsPSJub25lIi8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4K' +
  'PHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9' +
  'Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+' +
  'CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29t' +
  'L3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtQmxvY2s8L3RpdGxlPgogICAgPGRl' +
  'c2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iRXh0ZW5zaW9ucy9DbG91ZC9BbGl5dW4tT1NTLUJs' +
  'b2NrIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJv' +
  'a2Utb3BhY2l0eT0iMC4xNSI+CiAgICAgICAgPGcgaWQ9ImNsb3VkLXVwbG9hZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4w' +
  'MDAwMDAsIDEwLjAwMDAwMCkiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSIjMDAwMDAwIj4KICAgICAgICAgICAg' +
  'PGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIg' +
  'c3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY3g9IjIwIiBjeT0iMjAiIHI9IjE2Ij48L2NpcmNsZT4KICAgICAgICAgICAg' +
  'PGNpcmNsZSBpZD0iQ2lyY2xlLUNvcHkiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNSIgc3Ryb2tlLWxpbmVjYXA9InJv' +
  'dW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjeD0iMjAiIGN5PSIyMCIgcj0iMTIiPjwvY2lyY2xlPgogICAgICAgICAg' +
  'ICA8cGF0aCBpZD0iVXBsb2FkLUFycm93IiBkPSJNMjAsMTIgTDIwLDI4IE0xMiwyMCBMMjAsMTIgTDI4LDIwIiBzdHJva2U9' +
  'IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5k' +
  'IiBmaWxsPSJub25lIi8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Class for the Aliyun OSS-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3OSSBlocks {
  constructor(runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    this.runtime = runtime;

    /**
     * OSS configuration
     * @type {Object}
     * @private
     */
    this._ossConfig = {
      region: '',
      accessKeyId: '',
      accessKeySecret: '',
      bucket: ''
    };

    /**
     * Upload status
     * @type {string}
     * @private
     */
    this._uploadStatus = '未开始';
  }

  /**
   * Get the Scratch 3.0 blocks provided by this package.
   * @return {Array} Array of blocks, each block definition object.
   */
  getInfo() {
    return {
      id: 'oss',
      name: '阿里云OSS',
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: [
        {
          opcode: 'uploadToOSS',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.uploadToOSS',
            default: '上传到OSS [REGION] [ACCESS_KEY_ID] [ACCESS_KEY_SECRET] ' +
              '[BUCKET] [OBJECT_KEY] [BASE64_DATA]',
            description: 'Upload base64 data to OSS'
          }),
          arguments: {
            REGION: {
              type: ArgumentType.STRING,
              defaultValue: 'oss-cn-hangzhou'
            },
            ACCESS_KEY_ID: {
              type: ArgumentType.STRING,
              defaultValue: 'your-access-key-id'
            },
            ACCESS_KEY_SECRET: {
              type: ArgumentType.STRING,
              defaultValue: 'your-access-key-secret'
            },
            BUCKET: {
              type: ArgumentType.STRING,
              defaultValue: 'your-bucket-name'
            },
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'folder/file.png'
            },
            BASE64_DATA: {
              type: ArgumentType.STRING,
              defaultValue: 'data:image/png;base64,' +
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhf' +
                'DwAChwGA60e6kgAAAABJRU5ErkJggg=='
            }
          }
        }
      ]
    };
  }

  /**
   * Upload base64 data to OSS
   * @param {object} args - the arguments
   */
  uploadToOSS(args) {
    const region = Cast.toString(args.REGION);
    const accessKeyId = Cast.toString(args.ACCESS_KEY_ID);
    const accessKeySecret = Cast.toString(args.ACCESS_KEY_SECRET);
    const bucket = Cast.toString(args.BUCKET);
    const objectKey = Cast.toString(args.OBJECT_KEY);
    const base64Data = Cast.toString(args.BASE64_DATA);

    this._uploadStatus = '上传中...';

    try {
      // 转换 base64 数据为 Buffer
      const dataBuffer = this._base64ToBuffer(base64Data);

      // 创建 OSS 客户端
      const OSS = require('ali-oss');
      const client = new OSS({
        region: region,
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        bucket: bucket
      });

      // 上传数据
      client.put(objectKey, dataBuffer)
        .then(result => {
          this._uploadStatus = '上传成功';
          console.log('OSS上传结果:', result);
        })
        .catch(error => {
          this._uploadStatus = `上传失败：${error.message}`;
          console.error('OSS上传错误:', error);
        });
    } catch (error) {
      this._uploadStatus = `错误：${error.message}`;
      console.error('OSS配置错误:', error);
    }
  }

  /**
   * Convert base64 data to buffer
   * @param {string} base64Data - Base64 data string (with or without data URI prefix)
   * @return {Buffer} Buffer containing the data
   * @private
   */
  _base64ToBuffer(base64Data) {
    try {
      // 移除 data URI 前缀（如果存在）
      let base64String = base64Data;
      if (base64Data.includes(',')) {
        base64String = base64Data.split(',')[1];
      }

      // 验证 base64 字符串不为空
      if (!base64String || base64String.trim() === '') {
        throw new Error('Base64 数据为空');
      }

      // 使用正确导入的 Buffer.from 转换 base64 数据
      return Buffer.from(base64String, 'base64');
    } catch (error) {
      throw new Error(`Base64 转换失败：${error.message}`);
    }
  }

}

module.exports = Scratch3OSSBlocks;
