import React, { useState, useEffect } from "react";

import ImagesExplorer from "./ImagesExplorer.jsx";
import UserSignIn from "./UserSignIn.jsx"
import UserDash from "./UserDash.jsx";

export default function App() {
    const [isSearchingImgs, setIsSearchingImgs] = useState(true);

    const [userAuthToken, setUserAuthToken] = useState('');
    const [isUserAuthTokenInit, setIsUserAuthTokenInit] = useState(false);

    useEffect(() => {
        if (isUserAuthTokenInit) {
            localStorage.setItem('user_auth_token', userAuthToken);
        } else {
            if (localStorage.getItem('user_auth_token') !== null) {
                setUserAuthToken(localStorage.getItem('user_auth_token'));
            }
            setIsUserAuthTokenInit(true);
        }

        return () => { };
    }, [userAuthToken]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4">
            <div className="flex flex-row justify-between items-center py-6 border-b">
                <div className="flex flex-row justify-center gap-4">
                    <img className="w-12" src="/svg/main-logo.svg" alt="" />
                    <h1 className="text-4xl">SnapSilo</h1>
                </div>
                <div>
                    {isSearchingImgs ?
                        <img className="w-10 cursor-pointer opacity-75" src="/svg/person-outline.svg" alt="person icon"
                            onClick={() => setIsSearchingImgs(false)} />
                        :
                        <img className="w-10 cursor-pointer opacity-75" src="/svg/search-outline.svg" alt="search icon"
                            onClick={() => setIsSearchingImgs(true)} />
                    }
                </div>
            </div >

            {isSearchingImgs ?
                <ImagesExplorer></ImagesExplorer>
                :
                <>
                    {userAuthToken === '' ?
                        <UserSignIn onSignIn={(tok) => setUserAuthToken(tok)}></UserSignIn>
                        :
                        <UserDash userAuthToken={userAuthToken} onSignOut={() => setUserAuthToken('')}></UserDash>
                    }
                </>
            }

        </div >
    )
}