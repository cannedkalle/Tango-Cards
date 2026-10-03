import PortalNav from '../components/PortalNav';
import Game from './Game';
import './wild-guess.css';
import './tally.css';
import './reveal.css';
export const metadata={title:'Balls in the Ballpark | Kids Play Portal',description:'Big questions. Ballpark answers. Play five silly estimation puzzles and discover the maths behind them.'};
export default function Page(){return <><PortalNav/><main className="wg"><header className="wg-heading"><div><span className="wg-kicker">A little maths. A lot of imagination.</span><h1>Balls in the Ballpark<span aria-hidden="true">?</span></h1></div><p>Big questions.<br/>Ballpark answers.</p></header><Game/></main></>;}
