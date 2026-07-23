import React, { useState, useEffect } from "react";

import UserProfile from './UserProfile.jsx'
import UserImages from './UserImages.jsx'
import UserUpload from './UserUpload.jsx'

export default function UserDash({ userAuthToken, onSignOut }) {
    const S_PROFILE = 1;
    const S_IMAGES = 2;
    const S_UPLOAD = 3;

    const [currState, setCurrState] = useState(S_IMAGES);

    return (
        <>
            <div className="flex flex-row justify-center items-center py-6">
                <div className="flex flex-row justify-center gap-4 py-2 px-4 shadow rounded">
                    <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => { setCurrState(S_PROFILE); console.log(userAuthToken) }}>
                        <img className="w-8 cursor-pointer opacity-75" src="/svg/person-circle-outline.svg" alt="" />
                        <h3 className="text-lg">Profile</h3>
                    </div>
                    <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => setCurrState(S_IMAGES)}>
                        <img className="w-8 cursor-pointer opacity-75" src="/svg/image-outline.svg" alt="" />
                        <h3 className="text-lg">Images</h3>
                    </div>
                    <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => setCurrState(S_UPLOAD)}>
                        <img className="w-8 cursor-pointer opacity-75" src="/svg/cloud-upload-outline.svg" alt="" />
                        <h3 className="text-lg">Upload</h3>
                    </div>
                </div>
            </div>

            {currState === S_PROFILE &&
                <UserProfile userAuthToken={userAuthToken} onSignOut={() => onSignOut()}></UserProfile>}
            {currState === S_IMAGES && <UserImages></UserImages>}
            {currState === S_UPLOAD && <UserUpload></UserUpload>}
        </>
    )

}