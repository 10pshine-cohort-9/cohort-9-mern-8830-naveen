import React from 'react';
import {render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom';
import NotFound from '../pages/NotFound';
describe('NotFound',()=>{
it('should render the 404 page',() =>{
render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'404 - Page Not Found'})).toBeInTheDocument();
    expect(screen.getByText('This page does not exist.')).toBeInTheDocument();
});
it('should render a link to the notes page',()=>{
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    const notesLink=screen.getByRole('link',{name:'Go to Notes'});
    expect(notesLink).toBeInTheDocument();
    expect(notesLink).toHaveAttribute('href','/notes');
});
});
