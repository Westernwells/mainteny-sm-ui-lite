import {FileWithPreview} from 'models/files';

export const createMockFile = (
  name: string,
  path?: string,
  relativePath?: string,
  type = 'text/plain',
): FileWithPreview => {
  const file = new File(['mock content'], name, {
    type,
    lastModified: Date.now(),
  });

  return Object.assign(file, {
    path: path || `/${name}`,
    relativePath: relativePath || path || `/${name}`,
    preview: `blob:http://localhost:5173/${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    webkitRelativePath: relativePath || path || `/${name}`,
  }) as FileWithPreview;
};
