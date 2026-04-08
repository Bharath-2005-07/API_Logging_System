/**
 * IPFS Routes
 */

const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/response');
const IPFSService = require('../services/IPFSService');

/**
 * POST /api/ipfs/upload
 * Upload file to IPFS
 */
router.post('/upload', async (req, res) => {
  try {
    const { content, filename } = req.body;

    if (!content) {
      return errorResponse(res, 'Content is required', 400);
    }

    const ipfsHash = await IPFSService.uploadFile(content, filename || 'file');
    successResponse(res, { ipfsHash }, 'File uploaded to IPFS', 201);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/ipfs/retrieve/:hash
 * Retrieve file from IPFS
 */
router.get('/retrieve/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const content = await IPFSService.retrieveFile(hash);
    successResponse(res, { content }, 'File retrieved from IPFS');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
