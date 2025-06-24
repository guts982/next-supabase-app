import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import ShareRoom from './components/ShareRoom';
import ShareRoomP2P from './components/ShareRoomP2P';

const Index = () => {




    return (
        <div className='borde  min-h-[70vh] mt-4 rounded-sm'>
            <div className='grid gap-2 w-full grid-cols-2'>
               <ShareRoom />
               <ShareRoomP2P />
            </div>
        </div>
    );
};

export default Index;