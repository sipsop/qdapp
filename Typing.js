import { Map, mapCreate, mapEquals } from './Map.js'
import { zipWith, tail, includes, equals } from './Curry.js'
import { JSON } from './JSON.js'

export class Spec {
    validate = (x) => {
        throw Error("Not implemented")
    }
}

export class List extends Spec {

    constructor(item_spec) {
        super()
        this.item_spec = item_spec
    }

    validate = (xs) => xs.forEach((x) => this.item_spec.validate(x))

    toJSON = (val) => val.map(this.item_spec.toJSON)
    fromJSON = (doc) => doc.map(this.item_spec.fromJSON)
}

export class Tuple extends Spec {
    constructor(item_specs) {
        super()
        this.item_specs = item_specs
    }

    validate = (xs) => {
        var length = this.item_specs.length
        if (xs.length !== length) {
            throw Error(`Tuple has length ${xs.length}, expected ${length}`)
        }

        this.item_specs.forEach((item_spec, i) => {
            item_spec.validate(xs[i])
        })
    }

    toJSON = (val) => val.map((x, i) => {
        return this.item_specs[i].toJSON(x)
    })

    fromJSON = (doc) => doc.map((obj, i) => {
        if (i >= this.item_specs.length) {
            throw Error(`${doc} is not a valid tuple of type ${this.item_specs}`)
        }
        return this.item_specs[i].fromJSON(obj)
    })
}

export class Dict extends Spec {
    constructor(name, fields, specs) {
        super()
        this.name = name
        this.fields = fields
        this.specs = specs === undefined ? new Map(fields) : specs
    }

    initialize = (data) => {
        this.data = data
        this.size = data.size
        this.forAll(this._validateValue)
    }

    _validateKey = (key) => {
        if (!this.specs.has(key)) {
            throw Error(`Key ${key} not specified in ${this.name}`)
        }
    }

    _validateValue = (key, value) => {
        this._validateKey(key)
        this.specs.get(key).validate(value)
    }

    validate = (tdict) => {
        if (!(tdict instanceof Dict)) {
            /* Input is not a Dict, and may be an object like {x : 10} or an
               array such as [[x, 10]].

               Validate the input by constructing a Dict
            */
            this.call(tdict)
        } else {
            /* Validate each key/value pair */
            tdict.forAll(this._validateValue)
        }
    }

    call = (map) => {
        var result = new Dict(this.name, this.fields, this.specs)
        result.initialize(mapCreate(map))
        return result
    }

    has = (key) => {
        this._validateKey(key)
        return this.data.has(key)
    }

    get = (key) => {
        this._validateKey(key)
        return this.data.get(key)
    }

    set = (key, value) => {
        this._validateValue(key, value)
        this.data.set(key, value)
        this.size = this.data.size
    }

    update = (map) => {
        map.forAll(this.set)
    }

    delete = (key) => {
        this._validateKey(key)
        this.data.delete(key)
        this.size = this.data.size
    }

    keys = () => this.data.keys()
    values = () => this.data.values()

    forEach = (f) => this.data.forEach(f)

    forAll = (f) => this.data.forEach((value, key) => f(key, value))

    clear = () => {
        this.data.clear()
        this.size = 0
    }

    toJSON = (val) => {
        var result = []
        if (val instanceof Dict) {
            val = val.data
        } else {
            val = mapCreate(val)
        }

        val.forEach((value, key) => {
            var spec = this.specs.get(key)
            result.push([key, spec.toJSON(value)])
        })

        return result
    }

    fromJSON = (doc) => {
        var result = new Map()
        doc.forEach((key_value_pair) => {
            var key = key_value_pair[0]
            var value = key_value_pair[1]
            var value_spec = this.specs.get(key)
            var new_value = value_spec.fromJSON(value)
            result.set(key, new_value)
        })
        return this.call(result)
    }

    equals = (other) => {
        if (other instanceof Dict) {
            other = other.data
        }
        var result = mapEquals(this.data, other)
        return result
    }
}

export class SimpleDict extends Spec {
    constructor(key_spec, value_spec) {
        super()
        this.key_spec = key_spec
        this.value_spec = value_spec
    }

    validate = (d) => {
        d = mapCreate(d)
        d.forEach((value, key) => {
            this.key_spec.validate(key)
            this.value_spec.validate(value)
        })
    }

    toJSON = (val) => {
        var result = []
        mapCreate(val).forEach((value, key) => {
            var key = this.key_spec.toJSON(key)
            var value = this.value_spec.toJSON(value)
            result.push([key, value])
        })
        return result
    }

    fromJSON = (doc) => {
        var result = new Map()
        doc.forEach((key_value_pair) => {
            var key = this.key_spec.fromJSON(key_value_pair[0])
            var value = this.value_spec.fromJSON(key_value_pair[1])
            result.set(key, value)
        })
        return result
    }
}

export class MaybeNone extends Spec {
    constructor(item_spec) {
        super()
        this.item_spec = item_spec
    }

    validate = (x) => {
        if (x !== None) {
            this.item_spec.validate(x)
        }
    }

    toJSON = (val) => {
        if (val === None) {
            return null
        } else {
            return this.item_spec.toJSON(val)
        }
    }

    fromJSON = (doc) => {
        if (doc === null) {
            return None
        } else {
            return this.item_spec.fromJSON(doc)
        }
    }
}

export class Optional extends Spec {
    constructor(item_spec) {
        super()
        this.item_spec = item_spec
    }

    validate = (x) => {
        this.item_spec.validate(x)
    }

    toJSON = (val) => this.item_spec.toJSON(val)
    fromJSON = (doc) => this.item_spec.fromJSON(doc)
}

export class ForwardRef extends Spec {
    constructor(name) {
        super()
        this.name = name
        this.forward_spec = undefined
    }

    satisfy = (forward_spec) => {
        this.forward_spec = forward_spec
    }

    validate = (x) => {
        if (this.forward_spec === undefined) {
            throw Error(`Forward reference ${this.name} was not satisfied!`)
        }
        this.forward_spec.validate(x)
    }

    toJSON = (val) => this.item_spec.toJSON(val)
    fromJSON = (doc) => this.item_spec.fromJSON(doc)
}

export class Alias extends Spec {
    constructor(name, item_spec) {
        super()
        this.name = name
        this.item_spec = item_spec
    }

    validate = (x) => {
        this.item_spec.validate(x)
    }

    toJSON = (val) => this.item_spec.toJSON(val)
    fromJSON = (doc) => this.item_spec.fromJSON(doc)
}

export class Enum extends Spec {
    constructor(name, opts) {
        super()
        this.opts = opts
        this.prefixed_opts = []

        opts.forEach((opt) => {
            var prefixed_opt = name + '.' + opt
            this[opt] = prefixed_opt
            this.prefixed_opts.push(prefixed_opt)
        })
    }

    validate = (val) => {
        if (!includes(this.prefixed_opts, val)) {
            throw Error(`'${val}' is a valid for enum ${this.name}`)
        }
    }

    toJSON = (val) => val
    fromJSON = (doc) => doc
}

export class DataType extends Spec {
    constructor(name, cases) {
        super()
        this.name = name
        this.cases = cases
        this.case_names = cases.map((case_val) => case_val.name)

        /* Set Case objects as attributes of the datatype */
        this.cases.forEach((case_val) => {
            /* Case takes no arguments, instantiate it */
            if (case_val.param_specs.length === 0) {
                case_val = case_val.call()
            }
            this[case_val.name] = case_val
        })
    }

    validate = (case_inst) => {
        var name = case_inst.case_val.name
        if (!includes(this.case_names, name)) {
            throw Error(`Invalid constructor ${name} for datatype ${this.name}`)
        }
        case_inst.case_val.validate(case_inst)
    }

    toJSON = (case_inst) => {
        var args = []
        case_inst.case_val.param_specs.forEach((param_spec, i) => {
            var arg = param_spec.toJSON(case_inst.args[i])
            args.push(arg)
        })
        var result = {}
        result[case_inst.case_val.name] = args
        return result
    }

    fromJSON = (doc) => {
        var name = Object.keys(doc)[0]
        var json_args = doc[name]
        var case_val = this[name]

        if (case_val.param_specs.length === 0) {
            return case_val
        }

        var args = []
        case_val.param_specs.forEach((param_spec, i) => {
            var arg = param_spec.fromJSON(json_args[i])
            args.push(arg)
        })
        return new CaseInst(case_val, args)
    }
}

export class Case extends Spec {
    constructor(name) {
        super()
        this.name = name
        this.param_specs = tail(arguments)
    }

    validate = (case_inst) => {
        if (this.param_specs.length !== case_inst.args.length) {
            throw Error(`Case instance does not have the required number of ` +
                        `arguments: ${case_inst}`)
        }
        this.param_specs.forEach((param_spec, i) => {
            param_spec.validate(case_inst.args[i])
        })
    }

    // 'arguments' not defined for arrow functions?
    call() {
        var result = new CaseInst(this, Array.from(arguments))
        this.validate(result)
        return result
    }
}

export class CaseInst {
    constructor(case_val, args) {
        this.case_val = case_val
        this.args = args
    }

    equals = (other) => {
        if (other instanceof CaseInst) {
            return (  other.case_val.name == this.case_val.name
                   && this.args.length == other.args.length
                   && zipWith(equals, this.args, other.args)
                   )
        }
        return false
    }
}

export class BasicType extends Spec {
    constructor(name, valid_type) {
        super()
        this.name = name
        this.valid_type = valid_type
    }

    validate = (x) => {
        if (!this.valid_type(x)) {
            throw Error(`Value ${x} not of type ${this.name}`)
        }
    }

    toJSON = (val) => val
    fromJSON = (doc) => doc
}

export const BasicTypes =
    { int:      new BasicType("int", (x) => typeof(x) == 'number')
    , float:    new BasicType("float", (x) => typeof(x) == 'number')
    , bool:     new BasicType("bool", (x) => typeof(x) == 'boolean')
    , str:      new BasicType("str", (x) => typeof(x) == 'string')
    }

class NoneType {}
export const None = new NoneType()

export const toJSON = (val, spec)   => spec.toJSON(val)
export const fromJSON = (doc, spec) => spec.fromJSON(doc)
export const dumpJSON = (val, spec) => JSON.stringify(toJSON(val, spec))
export const loadJSON = (json, spec) => fromJSON(JSON.parse(json), spec)
