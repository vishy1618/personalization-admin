import './App.css';

import React from 'react';

import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import { AttributesAdmin } from './attributes';
import { AudiencesAdmin } from './audiences';
import { VariationsAdmin } from './variations';

function App() {
  return (
    <Router>
      <h1 style={{color: 'black'}}>Personalization Admin</h1>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/attributes"><b>Attributes</b></Link>
            </li>
            <li>
              <Link to="/audiences"><b>Audiences</b></Link>
            </li>
            <li>
              <Link to="/variations"><b>Variations</b></Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/attributes">
            <AttributesAdmin />
          </Route>
          <Route path="/audiences">
            <AudiencesAdmin />
          </Route>
          <Route path="/variations">
            <VariationsAdmin />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
