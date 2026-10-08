import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';

export async function pickDocument(allowedFormats) {
  try {
    const type = allowedFormats && allowedFormats.length > 0 ? allowedFormats : [types.images, types.pdf];
    const [file] = await pick({ type });
    return {
      name: file.name || 'document',
      uri: file.uri,
      mime: file.type || '',
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return null;
    throw error;
  }
}
