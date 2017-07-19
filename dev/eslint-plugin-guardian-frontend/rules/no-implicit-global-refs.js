const message = 'global property referenced without window prefix';

module.exports = {
    create(context) {
        let globalScope;

        return {
            Program() {
                globalScope = context.getScope();
            },
            Identifier(node) {
                if (isGlobalProperty(node) &&
                    !isLocalProperty(node)) {
                    context.report({
                        node,
                        message,
                    });
                }
            }
        };

        function isGlobalProperty(node) {
            return globalScope.variables.some(function(variable) {
                return variable.name === node.name;
            });
        };

        function isLocalProperty(node) {
            let declarations = [];
            let nextNode = node;

            while (nextNode) {
                if (nextNode.body && nextNode.body.length) {
                    nextNode.body.forEach(bodyNode => {
                        if (bodyNode.declarations) {
                            declarations.push(bodyNode.declarations.map(declaration => declaration.id.name))
                        }
                    });
                }

                nextNode = nextNode.parent;
            }

            declarations = declarations.reduce(function(a, b) {
                return a.concat(b);
            }, []).filter(item => item);


            return declarations.includes(node.name);
        };
    }
}