import React, { useState, useEffect } from "react";

export default function ImagesExplorer({ }) {
    return (
        <div className="flex flex-row justify-center items-center py-6">
            <div className="flex flex-row w-full sm:w-[640px] gap-4 border py-2 px-4 shadow rounded">
                <input className="grow p-1 focus:outline-none" type="text" placeholder="Search for images" />
                <img className="w-8 cursor-pointer opacity-75" src="/svg/search-outline.svg" alt="search icon" />
            </div>
        </div>
    )
}