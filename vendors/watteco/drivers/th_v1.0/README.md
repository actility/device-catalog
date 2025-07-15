## générer main.js

        npx webpack --config webpack.config.js

## tester le codec

        npm run test

## fonctionnement

<p>le driver du capteur appelle une partie commune séparée en trois fichier ; <code>standard.js</code>, <code>batch.js</code>, <code>decode.js</code>.</p>
<p>il est complété par un fichier spécifique à sa gamme.</p>

<p>le lien entre les fichier est fait avec <code>require()</code> de <code>node.js</code>. </p>
