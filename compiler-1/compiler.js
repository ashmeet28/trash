var Compiler = {};

(function () {
    var tokens = [];

    var assembly = '';

    var current = 0;


    var tableGlobalFunc = [];
    var tableGlobalVar = [];
    var tableLocalVar = [];

    var computStack = [];

    var currentScopeLevel = 1;

    var instP = 0;
    var globalVarP = 0;
    var localVarP = 0;

    function advance() {
        var token = tokens[current];
        current++;
        return token;
    }

    function peek() {
        return tokens[current];
    }

    function compileFunc() {
        advance();
        var token = advance();
        var cell = {
            Ident: '',
            parameters: [],
            returnValueType: {
                varSize: 0,
            },
        };

        cell.Ident = token.S;

        advance();

        while (true) {
            if (peek().T == 'RPAREN') {
                advance();
                break;
            }
            cell.parameters.push(getVarNameAndType());
            advance();
        }

        if (peek().T != 'LBRACE') {
            cell.returnValueType = getVarType();
        }

        advance();
        advance();

        tableGlobalFunc.push(cell);
        currentScopeLevel = 2;
        localVarP = 0;
    }

    function compileVar() {
        advance();
        var varInfo = getVarNameAndType();
        if (currentScopeLevel == 1) {
            var tableVarInfo = {info: varInfo, location: globalVarP};
            tableGlobalVar.push(tableVarInfo);
            globalVarP += varInfo.varType.varSize;
        } else {
            var tableVarInfo = {info: varInfo, location: localVarP};
            tableLocalVar.push(tableVarInfo);
            localVarP += varInfo.varType.varSize;
        }

        if (peek().T == 'ASSIGN') {
            computStack.push(tableVarInfo);
        }
    }

    function getVarNameAndType() {
        var token = advance();
        var varInfo = {
            Ident: '',
            varType: {},
        };
        varInfo.Ident = token.S;
        varInfo.varType = getVarType();
        return varInfo;
    }

    function parseIntLiteral() {
        var result = {
            varSize: 0,
            isSigned: false,
            varValue: 0,
        };
        var token = advance();
        var s = token.S;
        if (s.slice(-2) == 'u8') {
            s = s.slice(0, -2);
            result.varSize = 1;
        } else if (s.slice(-3) == 'i32') {
            s = s.slice(0, -3);
            result.varSize = 4;
            result.isSigned = true;
        }
        result.varValue = parseInt(s.replace(/_/g, ''));
        return result;
    }

    function getVarType() {
        var varType = {
            varSize: 0,
            isSigned: false,
            isPointer: false,
            pointerLevel: 0,
            isArray: false,
            arraySize: 0,
        };
        if (peek().T == 'MUL') {
            varType.isPointer = true;
            varType.pointerLevel = 1;
            while (peek().T == 'MUL') {
                advance();
                varType.pointerLevel++;
            }
        } else if (peek().T == 'LBRACK') {
            varType.isArray = true;
            varType.arraySize = parseIntLiteral().varValue;
            advance();
        }

        var token = advance();

        if (token.S == 'u8') {
            varType.varSize = 1;
        } else if (token.S == 'i32') {
            varType.varSize = 4;
            varType.isSigned = true;
        }
        return varType;
    }

    function compileSatement() {
        var token = advance();
    }

    function emitInst(inst) {
        assembly += inst;
        assembly += '\n';
        instP += 4;
    }
    function compile(tokens_input) {
        tokens = tokens_input;
        assembly = '';
        current = 0;

        tableGlobalFunc = [];
        tableGlobalVar = [];
        tableLocalVar = [];

        var token;

        // Memory map:
        // 0x0002_0000 Ecall Parameters
        // 0x0003_0000 Ecall Return Value
        // 0x1000_0000 Instructions
        // 0x2000_0000 Return Value
        // 0x2001_0000 Global Variables
        // 0x3fff_ffff Local Variables

        emitInst('lliu 01 00 00'); // Instructions: 0x1000_0000
        emitInst('lui  01 00 10');

        emitInst('lliu 02 00 00'); // Return Value: 0x2000_0000
        emitInst('lui  02 00 20');

        emitInst('lliu 03 00 00'); // Global Variables: 0x2001_0000
        emitInst('lui  03 01 20');

        emitInst('lliu 04 ff ff'); // Local Variables: 0x3fff_ffff
        emitInst('lui  04 ff 3f');

        while (true) {
            token = peek();
            if (token.T == 'EOF') {
                break;
            } else if (token.T == 'FUNC') {
                compileFunc();
            } else if (token.T == 'VAR') {
                compileVar();
            } else if (token.T == 'IDENT') {
                compileSatement();
            } else {
                advance();
            }
        }
        console.log(tableGlobalFunc);
        console.log(tableGlobalVar);
        console.log(tableLocalVar);
        console.log(instP);

        return assembly;
    }

    Compiler.compile = compile;
})();