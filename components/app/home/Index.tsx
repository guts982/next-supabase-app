"use client";

import React from 'react';
import { Hero } from './components/hero';
import ShareBox from './components/ShareBox';

const Index = () => {
    return (
        <>
        {/* <Hero /> */}
          <main className="border w-full flex-1 flex flex-col gap-6 p-4">
           <ShareBox />
          </main>
        </>
    );
};

export default Index;