const Runtime = require('../../engine/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const fs = require('fs');
const path = require('path');

/**
 * Icon svg to be displayed in the blocks category menu, encoded as a data URI.
 * @type {string}
 */
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVudTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJFeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtTWVudSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9ImNsb3VkLXVwbG9hZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDUuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjMDA3Q0ZGIiBvcGFjaXR5PSIwLjMiIGN4PSIxMCIgY3k9IjEwIiByPSI4Ij48L2NpcmNsZT4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlLUNvcHkiIGZpbGw9IiMwMDdDRkYiIG9wYWNpdHk9IjAuNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjYiPjwvY2lyY2xlPgogICAgICAgICAgICA8cGF0aCBpZD0iVXBsb2FkLUFycm93IiBkPSJNMTAsNiBMMTAsMTQgTTYsMTAgTDEwLDYgTDE0LDEwIiBzdHJva2U9IiMwMDdDRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5FeHRlbnNpb25zL0Nsb3VkL0FsaXl1bi1PU1MtQmxvY2s8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iRXh0ZW5zaW9ucy9DbG91ZC9BbGl5dW4tT1NTLUJsb2NrIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2Utb3BhY2l0eT0iMC4xNSI+CiAgICAgICAgPGcgaWQ9ImNsb3VkLXVwbG9hZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDEwLjAwMDAwMCkiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSIjMDAwMDAwIj4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY3g9IjIwIiBjeT0iMjAiIHI9IjE2Ij48L2NpcmNsZT4KICAgICAgICAgICAgPGNpcmNsZSBpZD0iQ2lyY2xlLUNvcHkiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjeD0iMjAiIGN5PSIyMCIgcj0iMTIiPjwvY2lyY2xlPgogICAgICAgICAgICA8cGF0aCBpZD0iVXBsb2FkLUFycm93IiBkPSJNMjAsMTIgTDIwLDI4IE0xMiwyMCBMMjAsMTIgTDI4LDIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

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
     * OSS client instance
     * @type {Object}
     * @private
     */
    this._ossClient = null;

    this._initializeOSS();
  }

  /**
   * Initialize OSS client
   * @private
   */
  _initializeOSS() {
    // 在浏览器环境中，我们需要使用CDN版本的OSS SDK
    if (typeof window !== 'undefined' && window.OSS) {
      this._ossClient = new window.OSS({
        region: this._ossConfig.region,
        accessKeyId: this._ossConfig.accessKeyId,
        accessKeySecret: this._ossConfig.accessKeySecret,
        bucket: this._ossConfig.bucket
      });
    }
  }

  /**
   * Get the Scratch 3.0 blocks provided by this package.
   * @return {Array} Array of blocks, each block definition object.
   */
  getInfo() {
    return {
      id: 'oss',
      name: formatMessage({
        id: 'oss.categoryName',
        default: '阿里云OSS',
        description: 'Name for the OSS category'
      }),
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: [
        {
          opcode: 'setOSSConfig',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.setConfig',
            default: '设置OSS配置 [REGION] [ACCESS_KEY_ID] [ACCESS_KEY_SECRET] [BUCKET]',
            description: 'Set OSS configuration'
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
            }
          }
        },
        {
          opcode: 'uploadFile',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.uploadFile',
            default: '上传文件 [FILE_PATH] 到 [OBJECT_KEY]',
            description: 'Upload file to OSS'
          }),
          arguments: {
            FILE_PATH: {
              type: ArgumentType.STRING,
              defaultValue: '/path/to/file.txt'
            },
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'folder/file.txt'
            }
          }
        },
        {
          opcode: 'uploadFileWithCallback',
          blockType: BlockType.COMMAND,
          text: formatMessage({
            id: 'oss.uploadFileWithCallback',
            default: '上传文件 [FILE_PATH] 到 [OBJECT_KEY] 完成后执行 [CALLBACK]',
            description: 'Upload file to OSS with callback'
          }),
          arguments: {
            FILE_PATH: {
              type: ArgumentType.STRING,
              defaultValue: '/path/to/file.txt'
            },
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'folder/file.txt'
            },
            CALLBACK: {
              type: ArgumentType.STRING,
              defaultValue: 'uploaded'
            }
          }
        },
        {
          opcode: 'getUploadStatus',
          blockType: BlockType.REPORTER,
          text: formatMessage({
            id: 'oss.getUploadStatus',
            default: '上传状态',
            description: 'Get upload status'
          })
        },
        {
          opcode: 'getFileURL',
          blockType: BlockType.REPORTER,
          text: formatMessage({
            id: 'oss.getFileURL',
            default: '获取文件URL [OBJECT_KEY]',
            description: 'Get file URL from OSS'
          }),
          arguments: {
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'folder/file.txt'
            }
          }
        }
      ]
    };
  }

  /**
   * Set OSS configuration
   * @param {object} args - the arguments
   */
  setOSSConfig(args) {
    const region = Cast.toString(args.REGION);
    const accessKeyId = Cast.toString(args.ACCESS_KEY_ID);
    const accessKeySecret = Cast.toString(args.ACCESS_KEY_SECRET);
    const bucket = Cast.toString(args.BUCKET);

    this._ossConfig = {
      region: region,
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
      bucket: bucket
    };

    // 重新初始化OSS客户端
    this._initializeOSS();
  }

  /**
   * Upload file to OSS
   * @param {object} args - the arguments
   */
  uploadFile(args) {
    const filePath = Cast.toString(args.FILE_PATH);
    const objectKey = Cast.toString(args.OBJECT_KEY);

    this._uploadFileToOSS(filePath, objectKey);
  }

  /**
   * Upload file to OSS with callback
   * @param {object} args - the arguments
   */
  uploadFileWithCallback(args) {
    const filePath = Cast.toString(args.FILE_PATH);
    const objectKey = Cast.toString(args.OBJECT_KEY);
    const callback = Cast.toString(args.CALLBACK);

    this._uploadFileToOSS(filePath, objectKey, callback);
  }

  /**
   * Get upload status
   * @return {string} Upload status
   */
  getUploadStatus() {
    return this._uploadStatus || '未开始';
  }

  /**
   * Get file URL from OSS
   * @param {object} args - the arguments
   * @return {string} File URL
   */
  getFileURL(args) {
    const objectKey = Cast.toString(args.OBJECT_KEY);

    if (!this._ossConfig.bucket || !this._ossConfig.region) {
      return '请先设置OSS配置';
    }

    const url = `https://${this._ossConfig.bucket}.${this._ossConfig.region}.aliyuncs.com/${objectKey}`;
    return url;
  }

  /**
   * Upload file to OSS (internal method)
   * @param {string} filePath - Local file path
   * @param {string} objectKey - OSS object key
   * @param {string} callback - Callback message
   * @private
   */
  _uploadFileToOSS(filePath, objectKey, callback = null) {
    this._uploadStatus = '上传中...';

    // 检查配置
    if (!this._ossConfig.region || !this._ossConfig.accessKeyId ||
      !this._ossConfig.accessKeySecret || !this._ossConfig.bucket) {
      this._uploadStatus = '错误：OSS配置不完整';
      return;
    }

    // 检查文件是否存在
    if (typeof window !== 'undefined') {
      // 浏览器环境
      this._uploadStatus = '错误：浏览器环境不支持本地文件上传';
      return;
    }

    // Node.js环境
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          this._uploadStatus = '错误：文件不存在';
          return;
        }

        // 读取文件
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);

        // 使用阿里云OSS SDK上传文件
        this._uploadWithSDK(fileBuffer, objectKey, callback);
      } catch (error) {
        this._uploadStatus = `错误：${error.message}`;
      }
    }
  }

  /**
   * Upload file using OSS SDK
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} objectKey - OSS object key
   * @param {string} callback - Callback message
   * @private
   */
  _uploadWithSDK(fileBuffer, objectKey, callback = null) {
    // 这里需要动态加载阿里云OSS SDK
    try {
      const OSS = require('ali-oss');

      const client = new OSS({
        region: this._ossConfig.region,
        accessKeyId: this._ossConfig.accessKeyId,
        accessKeySecret: this._ossConfig.accessKeySecret,
        bucket: this._ossConfig.bucket
      });

      client.put(objectKey, fileBuffer).then(result => {
        this._uploadStatus = '上传成功';
        if (callback) {
          this.runtime.startHats('event_whenbroadcastreceived', {
            BROADCAST_OPTION: callback
          });
        }
      }).catch(error => {
        this._uploadStatus = `上传失败：${error.message}`;
      });
    } catch (error) {
      this._uploadStatus = `SDK错误：${error.message}`;
    }
  }
}

module.exports = Scratch3OSSBlocks;
