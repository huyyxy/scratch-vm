const _Runtime = require('../../engine/runtime');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const Buffer = require('buffer').Buffer;
const OSS = require('ali-oss');

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
  'ICAgICAgIDxnIGlkPSJjbG91ZC11cGxvYWQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA1LjAwMDAwMCkiIGZp' +
  'bGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJDaXJjbGUiIGZpbGw9IiMwMDdDRkYiIG9w' +
  'YWNpdHk9IjAuMyIgY3g9IjEwIiBjeT0iMTAiIHI9IjgiPjwvY2lyY2xlPgogICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0i' +
  'Q2lyY2xlLUNvcHkiIGZpbGw9IiMwMDdDRkYiIG9wYWNpdHk9IjAuNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjYiPjwvY2lyY2xl' +
  'PgogICAgICAgICAgICAgICAgPHBhdGggaWQ9IlVwbG9hZC1BcnJvdyIgZD0iTTEwLDYgTDEwLDE0IE02LDEwIEwxMCw2IEwx' +
  'NCwxMCIgc3Ryb2tlPSIjMDA3Q0ZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxp' +
  'bmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPgogICAgICAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

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
  'a2Utb3BhY2l0eT0iMC4xNSI+CiAgICAgICAgICAgIDxnIGlkPSJjbG91ZC11cGxvYWQiIHRyYW5zZm9ybT0idHJhbnNsYXRl' +
  'KDAuMDAwMDAwLCAxMC4wMDAwMDApIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iIzAwMDAwMCI+CiAgICAgICAgICAgICAg' +
  'ICAgPGNpcmNsZSBpZD0iQ2lyY2xlIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjMiIHN0cm9rZS1saW5lY2FwPSJyb3Vu' +
  'ZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY3g9IjIwIiBjeT0iMjAiIHI9IjE2Ij48L2NpcmNsZT4KICAgICAgICAgICAg' +
  'ICAgICA8Y2lyY2xlIGlkPSJDaXJjbGUtQ29weSIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC41IiBzdHJva2UtbGluZWNh' +
  'cD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGN4PSIyMCIgY3k9IjIwIiByPSIxMiI+PC9jaXJjbGU+CiAgICAg' +
  'ICAgICAgICAgICAgPHBhdGggaWQ9IlVwbG9hZC1BcnJvdyIgZD0iTTIwLDEyIEwyMCwyOCBNMTIsMjAgTDIwLDEyIEwyOCwy' +
  'MCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVq' +
  'b2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPgogICAgICAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

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
     * @type {object}
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
          blockType: BlockType.REPORTER,
          text: formatMessage({
            id: 'oss.uploadToOSS',
            default: '上传到OSS [REGION] [ACCESS_KEY_ID] [ACCESS_KEY_SECRET] ' +
              '[BUCKET] [OBJECT_KEY] [BASE64_DATA]',
            description: 'Upload base64 data to OSS and return URL'
          }),
          arguments: {
            REGION: {
              type: ArgumentType.STRING,
              defaultValue: 'oss-cn-shanghai'
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
              defaultValue: 'scratch-oss'
            },
            OBJECT_KEY: {
              type: ArgumentType.STRING,
              defaultValue: 'white.png'
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
   * Upload base64 data to OSS using direct HTTP request
   * @param {object} args - the arguments
   * @return {Promise<string>} Promise that resolves to the uploaded file URL
   */
  async uploadToOSS(args) {
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

      // 使用直接HTTP请求上传到OSS
      const result = await this._uploadToOSSWithHTTP(
        region, accessKeyId, accessKeySecret, bucket, objectKey, dataBuffer
      );
      return result.url;
    } catch (error) {
      this._uploadStatus = `错误：${error.message}`;
      console.error('OSS配置错误:', error);
      throw error;
    }
  }

  /**
   * Upload to OSS using ali-oss SDK
   * @param {string} region - OSS region
   * @param {string} accessKeyId - Access Key ID
   * @param {string} accessKeySecret - Access Key Secret
   * @param {string} bucket - Bucket name
   * @param {string} objectKey - Object key
   * @param {Buffer} dataBuffer - Data to upload
   * @return {Promise<object>} Promise that resolves to the upload result with URL
   * @private
   */
  async _uploadToOSSWithHTTP(region, accessKeyId, accessKeySecret, bucket, objectKey, dataBuffer) {
    try {
      // 创建OSS客户端实例
      const client = new OSS({
        region: region,
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        bucket: bucket,
        secure: true, // 使用HTTPS
        timeout: 60000 // 设置超时时间为60秒
      });

      console.log('开始上传到OSS:', { bucket, objectKey, region });

      // 使用ali-oss SDK上传文件
      const result = await client.put(objectKey, dataBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });

      if (result && result.res && result.res.status === 200) {
        this._uploadStatus = '上传成功';
        console.log('OSS上传成功:', result);

        // 构建完整的URL
        const url = `https://${bucket}.${region}.aliyuncs.com/${objectKey}`;

        // 返回包含URL的结果对象
        return {
          name: objectKey,
          url: url,
          res: result.res
        };
      }
      throw new Error(`上传失败，状态码: ${result.res ? result.res.status : 'unknown'}`);
    } catch (error) {
      // 处理不同类型的错误
      if (error.code) {
        switch (error.code) {
          case 'SignatureDoesNotMatch':
            this._uploadStatus = '鉴权失败：签名不匹配，请检查AccessKey';
            break;
          case 'AccessDenied':
            this._uploadStatus = '权限不足：请检查AccessKey权限和存储桶权限';
            break;
          case 'NoSuchBucket':
            this._uploadStatus = '存储桶不存在：请检查存储桶名称';
            break;
          case 'InvalidAccessKeyId':
            this._uploadStatus = 'AccessKey无效：请检查AccessKey ID';
            break;
          case 'RequestTimeTooSkewed':
            this._uploadStatus = '请求时间偏差过大：请检查系统时间';
            break;
          default:
            this._uploadStatus = `上传失败：${error.code} - ${error.message}`;
        }
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this._uploadStatus = '网络错误：请检查网络连接和CORS配置';
      } else {
        this._uploadStatus = `上传失败：${error.message}`;
      }

      console.error('OSS上传错误:', error);
      throw error;
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
