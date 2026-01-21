import { invoke } from '@tauri-apps/api/core';

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  return await invoke<T>(command, args);
}

export const tauriCommands = {
  loadPdf: async (filePath: string) => {
    return await invokeCommand<{ id: string; pages: number; lastPage?: number }>(
      'load_pdf',
      { filePath }
    );
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
