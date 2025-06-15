
import { downloadFile } from './fileDownload';

export const generateJSONContent = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};
