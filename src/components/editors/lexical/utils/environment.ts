/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CAN_USE_DOM } from '@/utils/utils';

declare global {
    interface Document {
        documentMode?: unknown;
    }

    interface Window {
        MSStream?: unknown;
    }
}

const documentMode = CAN_USE_DOM && 'documentMode' in document ? document.documentMode : null;

export const CAN_USE_BEFORE_INPUT: boolean =
    CAN_USE_DOM && 'InputEvent' in window && !documentMode
        ? 'getTargetRanges' in new window.InputEvent('input')
        : false;

// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;
