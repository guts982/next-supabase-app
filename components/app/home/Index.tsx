
import React from 'react';
import PersistentShare from './components/PersistentShare';
import P2PShare from './components/P2PShare';

const Index = () => {

    return (
        <div className='border  min-h-[70vh] mt-4 rounded-sm'>
            <div className='grid gap-2 w-full grid-cols-2'>
               <PersistentShare />
               <P2PShare />
            </div>
        </div>
    );
};

export default Index;