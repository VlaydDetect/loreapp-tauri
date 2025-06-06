import { EditorElement } from './types';

export type EditorAction =
    | {
          type: 'ADD_ELEMENT';
          payload: {
              containerId: string;
              elementDetails: EditorElement;
          };
      }
    | {
          type: 'UPDATE_ELEMENT';
          payload: {
              elementDetails: EditorElement;
          };
      }
    | {
          type: 'DELETE_ELEMENT';
          payload: {
              elementDetails: EditorElement;
          };
      }
    | {
          type: 'CHANGE_CLICKED_ELEMENT';
          payload: {
              elementDetails?:
                  | EditorElement
                  | {
                        id: '';
                        content: [];
                        name: '';
                        styles: {};
                        type: null;
                    };
          };
      }
    | {
          type: 'TOGGLE_PREVIEW_MODE';
      }
    | {
          type: 'TOGGLE_LIVE_MODE';
          payload?: {
              value: boolean;
          };
      }
    | { type: 'REDO' }
    | { type: 'UNDO' }
    | {
          type: 'LOAD_DATA';
          payload: {
              elements: EditorElement[];
              withLive: boolean;
          };
      }
    | {
          type: 'SET_TEMPLATE_ID';
          payload: {
              templateId: string;
          };
      };
