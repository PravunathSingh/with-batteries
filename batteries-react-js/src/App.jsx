import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import HomePage from './pages/Home.page';
import AboutPage from './pages/About.page';
import Home from './components/Home';
import About from './components/About';
import ScrollToTop from './utils/ScrollToTop';

/** ScrollToTop is a utility function which as the name suggests scrolls a user to the top of the page whenever the user navigates to a new router. Since React-router-dom no longer does this out of the box, hence it's a nice utility to have */

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Home />
        <About />
        <ScrollToTop>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
          </Routes>
        </ScrollToTop>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} position='bottom-right' />
    </QueryClientProvider>
  );
};

export default App;
