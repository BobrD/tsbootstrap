let _serverSide;

try {
    _serverSide = void 0 === window;
} catch (e) {
    _serverSide = true;
}

export const serverSide = _serverSide;