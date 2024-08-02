test:
	npx blueprint build Channel
	npx blueprint build Jetton
	npx blueprint build JettonApp
	npx blueprint build TonApp
	npx blueprint test


all:
	npx blueprint build Channel
	npx blueprint build Jetton
	npx blueprint build JettonApp
	npx blueprint build TonApp