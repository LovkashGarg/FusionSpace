import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function randomID(len) {
  let result = '';
  if (result) return result;
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  const urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

export default function Chatbox() {
  const roomID = getUrlParams().get('roomId') || randomID(5);

  let myMeeting = async (element) => {
    // Generate Kit Token
    const appID = +process.env.REACT_APP_ZEGOCLOUD_APP_ID;
    const serverSecret = process.env.REACT_APP_ZEGOCLOUD_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));
// console.log(appID  , " : " + serverSecret);
    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Join room with chat enabled
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Join the chat',
          url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // One-on-one mode
      },
      showTextChat: true, // Enable in-app chat
      showUserList: true, // Show the user list if desired
    });
  };

  return (
    <div
      className="myCallContainer bg-slate-600"
      ref={myMeeting}
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}
