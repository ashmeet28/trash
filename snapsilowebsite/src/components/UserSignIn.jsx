import React, { useState, useEffect } from "react";

export default function UserSignIn({ onSignIn }) {
    const [userEmail, setUserEmail] = useState('');
    const [userCode, setUserCode] = useState('');

    const S_ENTER_EMAIL = 1;
    const S_ENTER_CODE = 2;
    const S_ENTER_CODE_TRY_AGAIN = 3;
    const S_SIGNING_IN = 4;

    const [currState, setCurrState] = useState(S_ENTER_EMAIL);

    return (
        <div className="w-full max-w-[400px] mx-auto p-2 my-10">
            <h1 className="text-center p-2 text-4xl my-2">Sign In</h1>
            <input className="text-center lowercase shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline my-2 disabled:shadow-none" type="text"
                value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                placeholder="username@example.com" disabled={currState !== S_ENTER_EMAIL} />
            <br />

            {currState === S_ENTER_EMAIL ?
                <button className="bg-blue-600 w-full text-white font-bold py-2 px-4 rounded my-2"
                    onClick={() => {
                        setCurrState(S_ENTER_CODE);
                        fetch("/api/send-code", { method: "POST", body: JSON.stringify({ email_address: userEmail }) });
                    }}>Next</button>
                :
                <>
                    <input className="text-center shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline my-2 disabled:shadow-none" type="text"
                        value={userCode} onChange={(e) => setUserCode(e.target.value)}
                        placeholder="Verification code" disabled={!(currState === S_ENTER_CODE || currState === S_ENTER_CODE_TRY_AGAIN)} />
                    <br />
                    <button className="bg-blue-600 w-full text-white font-bold py-2 px-4 rounded my-2 disabled:opacity-75"
                        onClick={() => {
                            setCurrState(S_SIGNING_IN);
                            fetch("/api/sign-in-with-code", {
                                method: "POST", body: JSON.stringify({ email_address: userEmail, verification_code: userCode })
                            }).then((res) => {
                                if (res.status === 200) {
                                    res.json().then((data) => {
                                        if (data.auth_token === "") {
                                            setCurrState(S_ENTER_CODE_TRY_AGAIN);
                                            setUserCode('');
                                        } else {
                                            onSignIn(data.auth_token);
                                        }
                                    })
                                }
                            })
                        }} disabled={currState === S_SIGNING_IN}>Done</button>
                </>
            }


            {currState === S_ENTER_EMAIL && <p className="opacity-50 text-center p-2">Enter your email address</p>}
            {currState === S_ENTER_CODE && <p className="opacity-50 text-center p-2">Enter the code sent to your email address</p>}
            {currState === S_ENTER_CODE_TRY_AGAIN && <p className="opacity-50 text-center p-2">Please try again</p>}
            {currState === S_SIGNING_IN && <p className="opacity-50 text-center p-2">Signing in...</p>}
        </div>
    )
}
