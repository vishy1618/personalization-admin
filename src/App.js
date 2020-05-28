import React from 'react';
import './App.css';
import { AudiencesAdmin } from "./audiences";
import { AttributesAdmin } from "./attributes";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

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
        </Switch>
      </div>
    </Router>
  );
}

export default App;
