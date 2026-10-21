import PortalNav from '../components/PortalNav';
import Game from './Game';
import './wild-guess.css';
import './tally.css';
import './reveal.css';
import './comparison.css';
export const metadata={title:'Balls in the Ballpark | Kids Play Portal',description:'Which is bigger? Pick between two surprising possibilities and discover the scale of our world.'};
export default function Page(){return <><PortalNav/><main className="wg"><header className="wg-heading"><div><span className="wg-kicker">Two wild possibilities. One bigger answer.</span><h1>Balls in the Ballpark<span aria-hidden="true">?</span></h1></div><p>Which one<br/>is bigger?</p></header><Game/></main></>;}
