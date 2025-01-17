<div align="center">
    <p align="center">
        <a href="https://www.youtube.com/watch?v=HqCNxhVDSgs" title="Duo — 1-on-1 peer learning for Khan Academy">
            <img src="https://i.imgur.com/LkUGAuD.png" alt="Logo" width="150px" />
        </a>
        <h1>Duo</h1>
    </p>
</div>

<p align="center">1-on-1 peer learning for Khan Academy.</p>

<div align="center">
    <p align="center">
        <a href="https://www.youtube.com/watch?v=HqCNxhVDSgs" title="Duo — 1-on-1 peer learning for Khan Academy">
            <img src="https://i.imgur.com/z03nnf8.png" alt="Duo screenshot" style="max-width: 800px; width: 100%" />
        </a>
    </p>
</div>

## Overview

Chrome extension client for the Duo project.

## What is the Duo project?

1-on-1 peer learning for Khan Academy.

Duo is a Chrome extension for students in the Khan Lab School or Oxford Day Academy PeerX classes to engage in peer learning. It is not intended for widespread public use and is not currently being maintained, although you are welcome to draw inspiration or adapt from it. It is licensed under the terms of the MIT license.

The project was created by Drew Bent and Phil Shen in 2020.

### Links
- [Video overview](https://www.youtube.com/watch?v=HqCNxhVDSgs)
- [Chrome extension used in KLS and ODA classes](http://bit.ly/chromeduo)

### Repositories
- [Chrome extension](https://github.com/drewbent/duo)
- [Backend and API](https://github.com/drewbent/duo-backend)
- [Admin dashboard](https://github.com/drewbent/duo-admin)

## Set Up

To run the Chrome extension:
1. Open Chrome and go to Window > Extensions
2. Click 'Load unpacked' and select the root folder of this project.
3. Visit Khan Academy (e.g. https://www.khanacademy.org/math/algebra).

## Testing

There are no unit tests. Before packaging a build for production, run `node verify-production.js` to make sure everything is in order.