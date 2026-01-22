import { invoke } from '@tauri-apps/api/core';

export interface PdfMetadata {
  path: string;
  file_name: string;
  file_size: number;
  num_pages: number | null;
}

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  return await invoke<T>(command, args);
}

export const tauriCommands = {
  loadPdf: async (path: string) => {
    return await invokeCommand<PdfMetadata>('load_pdf', { path });
  },

  getPdfInfo: async (path: string) => {
    return await invokeCommand<PdfMetadata>('get_pdf_info', { path });
  },

  saveReadingProgress: async (documentId: string, page: number) => {
    await invokeCommand<undefined>('save_reading_progress', {
      documentId,
      page,
    });
  },

  openFile: async () => {
    return await invokeCommand<string | null>('open_file_dialog');
  },
};
