var Compiler = {};

(function () {
    var tokens = [];

    var assembly = '';

    var current = 0;


    var tableGlobalFunc = [];
    var tableGlobalVar = [];
    var tableLocalVar = [];

    var isCompilingFunc = false;

    var compStack = [];

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
        var token = advance();
        var cell = {
            Ident: '',
            parameters: [],
            returnValueType: {
                varSize: 0,
            },
        };

        cell.Ident = token.S;
        isCompilingFunc = true;

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
    }

    function compileVar() {
        var cell = getVarNameAndType();
        if (isCompilingFunc) {
            tableLocalVar.push(cell);
        } else {
            tableGlobalVar.push(cell);
        }
    }

    function getVarNameAndType() {
        var token = advance();
        var cell = {
            Ident: '',
            varType: {},
        };
        cell.Ident = token.S;
        cell.varType = getVarType();
        return cell;
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

        assembly += 'lliu 01 00 00\n'; // Instructions: 0x1000_0000
        assembly += 'lui  01 00 10\n';

        assembly += 'lliu 02 00 00\n'; // Global Variables: 0x2001_0000
        assembly += 'lui  02 01 20\n';

        assembly += 'lliu 03 ff ff\n'; // Local Variables: 0x3fff_ffff
        assembly += 'lui  03 ff 3f\n';

        assembly += 'lliu 04 00 00\n'; // Return Value: 0x2000_0000
        assembly += 'lui  04 00 20\n';

        assembly += 'jalr 05 00 00\n';


        while (true) {
            token = advance();
            if (token.T == 'EOF') {
                break;
            } else if (token.T == 'FUNC') {
                compileFunc();
            } else if (token.T == 'VAR') {
                compileVar();
            };
        }
        console.log(
            tableGlobalFunc,
            tableGlobalVar,
            tableLocalVar,
        );

        return assembly;
    }

    Compiler.compile = compile;
})();