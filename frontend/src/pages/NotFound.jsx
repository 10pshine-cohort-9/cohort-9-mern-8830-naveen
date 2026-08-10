import React from 'react';
import {Link} from 'react-router-dom';

const NotFound = () => {
    return(
        <div className="flex min-h-screen flex flex-col items-center justify-center gap-3 bg-cream text-center">
            <h1 className="text-3xl font-semibold">404 - Page Not Found</h1>
            <p className="text-sm text-ink/50">This page does not exist.</p>
            <Link to="/notes" className ="text-sm font-medium text-clay hover:underline">Go to Notes</Link>
        </div>
    );
};
export default NotFound;