import { getAppById } from '../../lib/apps';
import { pageTitle, SITE_NAME } from '../../lib/names';
import Game from './Game';
import './animal-outsider.css';
import '../components/quiz-shell.css';

const app = getAppById('animal-outsider');

export const metadata = {
  title: pageTitle(app.name),
  description: 'Play ' + app.name + ' from ' + SITE_NAME + '.',
};

export default function AnimalOutsiderPage() {
  return <Game />;
}
