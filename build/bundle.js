
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/AddPeople.svelte generated by Svelte v3.43.0 */
    const file$6 = "src/components/AddPeople.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (73:6) {#each people as person}
    function create_each_block$3(ctx) {
    	let li;
    	let t0_value = /*person*/ ctx[12].id + "";
    	let t0;
    	let t1;
    	let t2_value = /*person*/ ctx[12].name + "";
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*person*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(":\n          ");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			t5 = space();
    			attr_dev(button, "class", "remove-button svelte-chggpk");
    			add_location(button, file$6, 77, 10, 1859);
    			attr_dev(li, "class", "list-item svelte-chggpk");
    			add_location(li, file$6, 73, 8, 1778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, button);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*people*/ 1 && t0_value !== (t0_value = /*person*/ ctx[12].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*people*/ 1 && t2_value !== (t2_value = /*person*/ ctx[12].name + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(73:6) {#each people as person}",
    		ctx
    	});

    	return block;
    }

    // (97:4) {#if people.length > 1}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Next";
    			add_location(button, file$6, 97, 6, 2371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleNextButton*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(97:4) {#if people.length > 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let div0;
    	let p;
    	let t0;
    	let strong;
    	let t2;
    	let h2;
    	let t4;
    	let ul;
    	let t5;
    	let div2;
    	let form;
    	let input;
    	let t6;
    	let div1;
    	let t7_value = /*error*/ ctx[1].name + "";
    	let t7;
    	let t8;
    	let br0;
    	let t9;
    	let button;
    	let t11;
    	let br1;
    	let t12;
    	let mounted;
    	let dispose;
    	let each_value = /*people*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let if_block = /*people*/ ctx[0].length > 1 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text("Please enter the names of the persons you dined with below. Once you have\n      entered more than 2 diners, please click ");
    			strong = element("strong");
    			strong.textContent = "\"Next\"";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "People";
    			t4 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div2 = element("div");
    			form = element("form");
    			input = element("input");
    			t6 = space();
    			div1 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Add";
    			t11 = space();
    			br1 = element("br");
    			t12 = space();
    			if (if_block) if_block.c();
    			add_location(strong, file$6, 68, 47, 1641);
    			add_location(p, file$6, 66, 4, 1510);
    			attr_dev(h2, "class", "heading svelte-chggpk");
    			add_location(h2, file$6, 70, 4, 1678);
    			attr_dev(ul, "class", "people-list");
    			add_location(ul, file$6, 71, 4, 1714);
    			attr_dev(div0, "class", "show-people svelte-chggpk");
    			add_location(div0, file$6, 65, 2, 1480);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "add person");
    			add_location(input, file$6, 90, 6, 2137);
    			attr_dev(div1, "class", "error svelte-chggpk");
    			add_location(div1, file$6, 91, 6, 2208);
    			attr_dev(br0, "class", "break");
    			add_location(br0, file$6, 92, 6, 2252);
    			add_location(button, file$6, 93, 6, 2279);
    			add_location(form, file$6, 89, 4, 2084);
    			attr_dev(br1, "class", "break");
    			add_location(br1, file$6, 95, 4, 2316);
    			attr_dev(div2, "class", "add-person");
    			add_location(div2, file$6, 88, 2, 2055);
    			attr_dev(div3, "class", "add-people-container svelte-chggpk");
    			add_location(div3, file$6, 64, 0, 1443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(div0, t2);
    			append_dev(div0, h2);
    			append_dev(div0, t4);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, form);
    			append_dev(form, input);
    			set_input_value(input, /*name*/ ctx[2]);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, t7);
    			append_dev(form, t8);
    			append_dev(form, br0);
    			append_dev(form, t9);
    			append_dev(form, button);
    			append_dev(div2, t11);
    			append_dev(div2, br1);
    			append_dev(div2, t12);
    			if (if_block) if_block.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clear, people*/ 17) {
    				each_value = /*people*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*name*/ 4 && input.value !== /*name*/ ctx[2]) {
    				set_input_value(input, /*name*/ ctx[2]);
    			}

    			if (dirty & /*error*/ 2 && t7_value !== (t7_value = /*error*/ ctx[1].name + "")) set_data_dev(t7, t7_value);

    			if (/*people*/ ctx[0].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let id;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddPeople', slots, []);
    	const dispatch = createEventDispatcher();

    	//create empty array to push to later
    	let people = [];

    	// validating errors
    	let error = { name: "" };

    	let name = "";
    	let total = 0;

    	//form validation
    	let valid = false;

    	const handleSubmit = () => {
    		valid = true;

    		if (name.length < 1) {
    			valid = false;
    			$$invalidate(1, error.name = "Name cannot be empty", error);
    		} else {
    			$$invalidate(1, error.name = "", error);
    		}

    		if (valid) {
    			$$invalidate(0, people = [
    				...people,
    				{
    					id,
    					name,
    					total,
    					itemsOrdered: [],
    					percentageOfTotal: 0,
    					percentageOfSalesTax: 0,
    					percentageOfTip: 0
    				}
    			]);

    			$$invalidate(2, name = "");
    		} // console.log(people);
    	};

    	// delete name from name array
    	const clear = id => {
    		$$invalidate(0, people = people.filter(person => person.id != id));

    		// for each loop + if statment to subtract the id from anyone with an id greater than the person who was deleted
    		people.forEach(person => {
    			if (person.id > id) {
    				person.id--;
    			}
    		});
    	}; // console.log(people);

    	// handles next button and passes the "gotPeopleObject" action up to App.svelte
    	const handleNextButton = () => {
    		dispatch("gotPeopleObject", people);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddPeople> was created with unknown prop '${key}'`);
    	});

    	const click_handler = person => {
    		clear(person.id);
    	};

    	function input_input_handler() {
    		name = this.value;
    		$$invalidate(2, name);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		people,
    		error,
    		name,
    		total,
    		valid,
    		handleSubmit,
    		clear,
    		handleNextButton,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ('people' in $$props) $$invalidate(0, people = $$props.people);
    		if ('error' in $$props) $$invalidate(1, error = $$props.error);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('total' in $$props) total = $$props.total;
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('id' in $$props) id = $$props.id;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*people*/ 1) {
    			// increments to add create a unique ID value in the people object
    			id = people.length + 1;
    		}
    	};

    	return [
    		people,
    		error,
    		name,
    		handleSubmit,
    		clear,
    		handleNextButton,
    		click_handler,
    		input_input_handler
    	];
    }

    class AddPeople extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPeople",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/AddItems.svelte generated by Svelte v3.43.0 */
    const file$5 = "src/components/AddItems.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (120:14) {#each item.peopleWhoAteIDs as person}
    function create_each_block_2(ctx) {
    	let p;
    	let t_value = /*person*/ ctx[19][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$5, 120, 16, 2866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*person*/ ctx[19][1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(120:14) {#each item.peopleWhoAteIDs as person}",
    		ctx
    	});

    	return block;
    }

    // (110:8) {#each items as item}
    function create_each_block_1$1(ctx) {
    	let li;
    	let div0;
    	let p;
    	let t0;
    	let t1_value = /*item*/ ctx[6].quantity + "";
    	let t1;
    	let t2;
    	let t3_value = /*item*/ ctx[6].itemName + "";
    	let t3;
    	let t4;
    	let t5_value = /*item*/ ctx[6].itemAmount + "";
    	let t5;
    	let t6;
    	let t7_value = /*item*/ ctx[6].quantity * /*item*/ ctx[6].itemAmount + "";
    	let t7;
    	let t8;
    	let div1;
    	let t9;
    	let div2;
    	let button;
    	let t11;
    	let br;
    	let t12;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*item*/ ctx[6].peopleWhoAteIDs;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*item*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			p = element("p");
    			t0 = text("Quantity: ");
    			t1 = text(t1_value);
    			t2 = text(" | Name: ");
    			t3 = text(t3_value);
    			t4 = text(" | Price: $");
    			t5 = text(t5_value);
    			t6 = text("\n                | Item Total: $");
    			t7 = text(t7_value);
    			t8 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Delete";
    			t11 = space();
    			br = element("br");
    			t12 = space();
    			add_location(p, file$5, 112, 14, 2577);
    			add_location(div0, file$5, 111, 12, 2557);
    			add_location(div1, file$5, 118, 12, 2791);
    			attr_dev(button, "class", "remove-button svelte-1ntzduf");
    			add_location(button, file$5, 124, 14, 2958);
    			add_location(div2, file$5, 123, 12, 2938);
    			add_location(br, file$5, 131, 12, 3153);
    			attr_dev(li, "class", "list-item svelte-1ntzduf");
    			add_location(li, file$5, 110, 10, 2522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(li, t8);
    			append_dev(li, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(li, t9);
    			append_dev(li, div2);
    			append_dev(div2, button);
    			append_dev(li, t11);
    			append_dev(li, br);
    			append_dev(li, t12);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 2 && t1_value !== (t1_value = /*item*/ ctx[6].quantity + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*items*/ 2 && t3_value !== (t3_value = /*item*/ ctx[6].itemName + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*items*/ 2 && t5_value !== (t5_value = /*item*/ ctx[6].itemAmount + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*items*/ 2 && t7_value !== (t7_value = /*item*/ ctx[6].quantity * /*item*/ ctx[6].itemAmount + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*items*/ 2) {
    				each_value_2 = /*item*/ ctx[6].peopleWhoAteIDs;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(110:8) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (155:8) {#each people as person}
    function create_each_block$2(ctx) {
    	let div1;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*person*/ ctx[19].name + "";
    	let t1;
    	let br0;
    	let t2;
    	let div0;
    	let t3_value = /*error*/ ctx[5].checkbox + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			br0 = element("br");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = [/*person*/ ctx[19].id, /*person*/ ctx[19].name];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[15][0].push(input);
    			add_location(input, file$5, 156, 12, 3856);
    			add_location(br0, file$5, 161, 25, 4020);
    			attr_dev(div0, "class", "error svelte-1ntzduf");
    			add_location(div0, file$5, 162, 12, 4039);
    			add_location(br1, file$5, 163, 12, 4093);
    			add_location(div1, file$5, 155, 10, 3838);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			input.checked = ~/*peopleWhoAte*/ ctx[3].indexOf(input.__value);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, br0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, br1);
    			append_dev(div1, t5);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1 && input_value_value !== (input_value_value = [/*person*/ ctx[19].id, /*person*/ ctx[19].name])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*peopleWhoAte*/ 8) {
    				input.checked = ~/*peopleWhoAte*/ ctx[3].indexOf(input.__value);
    			}

    			if (dirty & /*people*/ 1 && t1_value !== (t1_value = /*person*/ ctx[19].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*error*/ 32 && t3_value !== (t3_value = /*error*/ ctx[5].checkbox + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*$$binding_groups*/ ctx[15][0].splice(/*$$binding_groups*/ ctx[15][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(155:8) {#each people as person}",
    		ctx
    	});

    	return block;
    }

    // (173:4) {#if items.length > 1}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Next";
    			add_location(button, file$5, 173, 6, 4295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleNextButton*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(173:4) {#if items.length > 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div8;
    	let p;
    	let t0;
    	let strong;
    	let t2;
    	let div1;
    	let div0;
    	let h2;
    	let t4;
    	let ul;
    	let t5;
    	let div7;
    	let form;
    	let input0;
    	let t6;
    	let div2;
    	let t7_value = /*error*/ ctx[5].name + "";
    	let t7;
    	let t8;
    	let input1;
    	let t9;
    	let div3;
    	let t10_value = /*error*/ ctx[5].amount + "";
    	let t10;
    	let t11;
    	let div5;
    	let input2;
    	let t12;
    	let div4;
    	let t13_value = /*error*/ ctx[5].quantity + "";
    	let t13;
    	let t14;
    	let div6;
    	let t15;
    	let br0;
    	let t16;
    	let button;
    	let t18;
    	let br1;
    	let t19;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*items*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*people*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block = /*items*/ ctx[1].length > 1 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			p = element("p");
    			t0 = text("Please enter the items that were ordered as well as the price. Once you have\n    entered more than 2 items, please click ");
    			strong = element("strong");
    			strong.textContent = "\"Next\"";
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Items";
    			t4 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			div7 = element("div");
    			form = element("form");
    			input0 = element("input");
    			t6 = space();
    			div2 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div3 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div5 = element("div");
    			input2 = element("input");
    			t12 = space();
    			div4 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			br0 = element("br");
    			t16 = space();
    			button = element("button");
    			button.textContent = "Add";
    			t18 = space();
    			br1 = element("br");
    			t19 = space();
    			if (if_block) if_block.c();
    			add_location(strong, file$5, 103, 44, 2348);
    			add_location(p, file$5, 101, 2, 2219);
    			attr_dev(h2, "class", "heading svelte-1ntzduf");
    			add_location(h2, file$5, 107, 6, 2422);
    			attr_dev(ul, "class", "item-list");
    			add_location(ul, file$5, 108, 6, 2459);
    			add_location(div0, file$5, 106, 4, 2410);
    			attr_dev(div1, "class", "show-items svelte-1ntzduf");
    			add_location(div1, file$5, 105, 2, 2381);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "add item name");
    			add_location(input0, file$5, 140, 6, 3307);
    			attr_dev(div2, "class", "error svelte-1ntzduf");
    			add_location(div2, file$5, 141, 6, 3381);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "add price amount");
    			add_location(input1, file$5, 142, 6, 3425);
    			attr_dev(div3, "class", "error svelte-1ntzduf");
    			add_location(div3, file$5, 143, 6, 3504);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "Quantity");
    			attr_dev(input2, "class", "quantity svelte-1ntzduf");
    			add_location(input2, file$5, 145, 8, 3564);
    			attr_dev(div4, "class", "error svelte-1ntzduf");
    			add_location(div4, file$5, 151, 8, 3706);
    			add_location(div5, file$5, 144, 6, 3550);
    			attr_dev(div6, "class", "name-checkbox");
    			add_location(div6, file$5, 153, 6, 3767);
    			add_location(br0, file$5, 167, 6, 4152);
    			add_location(button, file$5, 169, 6, 4218);
    			add_location(form, file$5, 139, 4, 3254);
    			add_location(br1, file$5, 171, 4, 4255);
    			attr_dev(div7, "class", "add-item");
    			add_location(div7, file$5, 138, 2, 3227);
    			attr_dev(div8, "class", "add-items-container svelte-1ntzduf");
    			add_location(div8, file$5, 100, 0, 2183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, p);
    			append_dev(p, t0);
    			append_dev(p, strong);
    			append_dev(div8, t2);
    			append_dev(div8, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t4);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div7, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*item*/ ctx[6]);
    			append_dev(form, t6);
    			append_dev(form, div2);
    			append_dev(div2, t7);
    			append_dev(form, t8);
    			append_dev(form, input1);
    			set_input_value(input1, /*amount*/ ctx[2]);
    			append_dev(form, t9);
    			append_dev(form, div3);
    			append_dev(div3, t10);
    			append_dev(form, t11);
    			append_dev(form, div5);
    			append_dev(div5, input2);
    			set_input_value(input2, /*quantity*/ ctx[4]);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, t13);
    			append_dev(form, t14);
    			append_dev(form, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			append_dev(form, t15);
    			append_dev(form, br0);
    			append_dev(form, t16);
    			append_dev(form, button);
    			append_dev(div7, t18);
    			append_dev(div7, br1);
    			append_dev(div7, t19);
    			if (if_block) if_block.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clear, items*/ 130) {
    				each_value_1 = /*items*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*item*/ 64 && input0.value !== /*item*/ ctx[6]) {
    				set_input_value(input0, /*item*/ ctx[6]);
    			}

    			if (dirty & /*error*/ 32 && t7_value !== (t7_value = /*error*/ ctx[5].name + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*amount*/ 4 && input1.value !== /*amount*/ ctx[2]) {
    				set_input_value(input1, /*amount*/ ctx[2]);
    			}

    			if (dirty & /*error*/ 32 && t10_value !== (t10_value = /*error*/ ctx[5].amount + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*quantity*/ 16 && to_number(input2.value) !== /*quantity*/ ctx[4]) {
    				set_input_value(input2, /*quantity*/ ctx[4]);
    			}

    			if (dirty & /*error*/ 32 && t13_value !== (t13_value = /*error*/ ctx[5].quantity + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*error, people, peopleWhoAte*/ 41) {
    				each_value = /*people*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*items*/ ctx[1].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div7, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let id;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddItems', slots, []);
    	const dispatch = createEventDispatcher();

    	// declaring variables which we will be binding to below on input form
    	let item = "";

    	let amount;
    	let peopleWhoAte = [];
    	let quantity = 1;

    	// reactive variable to add an ID to each
    	let items = [];

    	let { people } = $$props;

    	// form validation
    	let valid = false;

    	let error = {
    		name: "",
    		amount: "",
    		quantity: "",
    		checkbox: ""
    	};

    	// delete item
    	const clear = id => {
    		// console.log("click");
    		$$invalidate(1, items = items.filter(item => item.id != id));

    		items.forEach(item => {
    			if (item.id > id) {
    				item.id--;
    			}
    		});
    	};

    	const handleSubmit = () => {
    		valid = true;

    		if (item.length < 1) {
    			valid = false;
    			$$invalidate(5, error.name = "Name cannot be empty", error);
    		}

    		if (amount <= 0) {
    			valid = false;
    			$$invalidate(5, error.amount = "Price must be greater than 0", error);
    		} else if (amount === undefined) {
    			valid = false;
    			$$invalidate(5, error.amount = "Please enter an amount", error);
    		} else if (amount[0] === "$") {
    			valid = false;
    			$$invalidate(5, error.amount = 'Please remove "$"', error);
    		} else if (!amount.match(/^-?\d+$/) && !amount.match(/^\d+\.\d+$/)) {
    			valid = false;
    			$$invalidate(5, error.amount = "Please enter a number", error);
    		} else if (quantity < 1) {
    			valid = false;
    			$$invalidate(5, error.quantity = "You must enter a quantity larger than 1", error);
    		} else if (peopleWhoAte.length < 1) {
    			valid = false;
    			$$invalidate(5, error.checkbox = "At least one person must be selected", error);
    		} else {
    			$$invalidate(5, error.name = "", error);
    			$$invalidate(5, error.amount = "", error);
    			$$invalidate(5, error.quantity = "", error);
    			$$invalidate(5, error.checkbox = "", error);
    		}

    		if (valid) {
    			$$invalidate(1, items = [
    				...items,
    				{
    					id,
    					itemName: item,
    					itemAmount: amount,
    					quantity,
    					peopleWhoAteIDs: peopleWhoAte
    				}
    			]);

    			$$invalidate(6, item = "");
    			$$invalidate(2, amount = null);
    			$$invalidate(4, quantity = 1);
    			$$invalidate(3, peopleWhoAte = []);
    		} // console.log(items);
    	};

    	const handleNextButton = () => {
    		// console.log(items);
    		dispatch("gotItemsArray", items);
    	};

    	const writable_props = ['people'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddItems> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	const click_handler = item => {
    		clear(item.id);
    	};

    	function input0_input_handler() {
    		item = this.value;
    		$$invalidate(6, item);
    	}

    	function input1_input_handler() {
    		amount = this.value;
    		$$invalidate(2, amount);
    	}

    	function input2_input_handler() {
    		quantity = to_number(this.value);
    		$$invalidate(4, quantity);
    	}

    	function input_change_handler() {
    		peopleWhoAte = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(3, peopleWhoAte);
    	}

    	$$self.$$set = $$props => {
    		if ('people' in $$props) $$invalidate(0, people = $$props.people);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		item,
    		amount,
    		peopleWhoAte,
    		quantity,
    		items,
    		people,
    		valid,
    		error,
    		clear,
    		handleSubmit,
    		handleNextButton,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(6, item = $$props.item);
    		if ('amount' in $$props) $$invalidate(2, amount = $$props.amount);
    		if ('peopleWhoAte' in $$props) $$invalidate(3, peopleWhoAte = $$props.peopleWhoAte);
    		if ('quantity' in $$props) $$invalidate(4, quantity = $$props.quantity);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('people' in $$props) $$invalidate(0, people = $$props.people);
    		if ('valid' in $$props) valid = $$props.valid;
    		if ('error' in $$props) $$invalidate(5, error = $$props.error);
    		if ('id' in $$props) id = $$props.id;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items*/ 2) {
    			id = items.length + 1;
    		}
    	};

    	return [
    		people,
    		items,
    		amount,
    		peopleWhoAte,
    		quantity,
    		error,
    		item,
    		clear,
    		handleSubmit,
    		handleNextButton,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class AddItems extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { people: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddItems",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*people*/ ctx[0] === undefined && !('people' in props)) {
    			console.warn("<AddItems> was created without expected prop 'people'");
    		}
    	}

    	get people() {
    		throw new Error("<AddItems>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set people(value) {
    		throw new Error("<AddItems>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Results.svelte generated by Svelte v3.43.0 */

    const { console: console_1 } = globals;
    const file$4 = "src/components/Results.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (82:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let each_value = /*people*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$4, 82, 4, 2265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1) {
    				each_value = /*people*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(82:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:2) {#if fullyCalculated === false}
    function create_if_block$1(ctx) {
    	let div;
    	let form;
    	let h4;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			h4 = element("h4");
    			h4.textContent = "One last step, please enter the sales tax and tip";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Calculate";
    			add_location(h4, file$4, 65, 8, 1861);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "placeholder", "Sales Tax Amount");
    			add_location(input0, file$4, 66, 8, 1928);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "placeholder", "Tip Amount");
    			add_location(input1, file$4, 72, 8, 2069);
    			add_location(button, file$4, 78, 8, 2199);
    			add_location(form, file$4, 64, 6, 1795);
    			add_location(div, file$4, 63, 4, 1783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, h4);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			set_input_value(input0, /*salesTax*/ ctx[1]);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			set_input_value(input1, /*tip*/ ctx[2]);
    			append_dev(form, t3);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmitButton*/ ctx[4]), { once: true }, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*salesTax*/ 2 && to_number(input0.value) !== /*salesTax*/ ctx[1]) {
    				set_input_value(input0, /*salesTax*/ ctx[1]);
    			}

    			if (dirty & /*tip*/ 4 && to_number(input1.value) !== /*tip*/ ctx[2]) {
    				set_input_value(input1, /*tip*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:2) {#if fullyCalculated === false}",
    		ctx
    	});

    	return block;
    }

    // (88:10) {#each person.itemsOrdered as item}
    function create_each_block_1(ctx) {
    	let p;
    	let t0_value = /*item*/ ctx[16][2].toFixed(2) + "";
    	let t0;
    	let t1;
    	let t2_value = /*item*/ ctx[16][1] + "";
    	let t2;
    	let t3;
    	let t4_value = /*item*/ ctx[16][0] + "";
    	let t4;
    	let t5;
    	let t6_value = (/*item*/ ctx[16][1] * /*item*/ ctx[16][2]).toFixed(2) + "";
    	let t6;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" Units, @ $");
    			t2 = text(t2_value);
    			t3 = text(" |\n              ");
    			t4 = text(t4_value);
    			t5 = text(" | Item Cost (w/ Quantity): $");
    			t6 = text(t6_value);
    			add_location(p, file$4, 88, 12, 2455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1 && t0_value !== (t0_value = /*item*/ ctx[16][2].toFixed(2) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*people*/ 1 && t2_value !== (t2_value = /*item*/ ctx[16][1] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*people*/ 1 && t4_value !== (t4_value = /*item*/ ctx[16][0] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*people*/ 1 && t6_value !== (t6_value = (/*item*/ ctx[16][1] * /*item*/ ctx[16][2]).toFixed(2) + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(88:10) {#each person.itemsOrdered as item}",
    		ctx
    	});

    	return block;
    }

    // (84:6) {#each people as person}
    function create_each_block$1(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*person*/ ctx[13].name + "";
    	let t0;
    	let t1;
    	let h4;
    	let t3;
    	let t4;
    	let p0;
    	let t5;
    	let t6_value = (/*person*/ ctx[13].total - (/*person*/ ctx[13].percentageOfTip + /*person*/ ctx[13].percentageOfSalesTax)).toFixed(2) + "";
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let t9_value = /*person*/ ctx[13].percentageOfSalesTax.toFixed(2) + "";
    	let t9;
    	let t10;
    	let p2;
    	let t11;
    	let t12_value = /*person*/ ctx[13].percentageOfTip.toFixed(2) + "";
    	let t12;
    	let t13;
    	let p3;
    	let strong;
    	let t14;
    	let t15_value = /*person*/ ctx[13].total.toFixed(2) + "";
    	let t15;
    	let t16;
    	let each_value_1 = /*person*/ ctx[13].itemsOrdered;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "Summary:";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			p0 = element("p");
    			t5 = text("Subtotal = $");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text("Percentage of Sales Tax = $");
    			t9 = text(t9_value);
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Percentage of Tip = $");
    			t12 = text(t12_value);
    			t13 = space();
    			p3 = element("p");
    			strong = element("strong");
    			t14 = text("Total Amount = $");
    			t15 = text(t15_value);
    			t16 = space();
    			add_location(h2, file$4, 85, 10, 2346);
    			add_location(h4, file$4, 86, 10, 2379);
    			add_location(p0, file$4, 95, 10, 2678);
    			add_location(p1, file$4, 101, 10, 2858);
    			add_location(p2, file$4, 104, 10, 2967);
    			add_location(strong, file$4, 106, 13, 3045);
    			add_location(p3, file$4, 106, 10, 3042);
    			attr_dev(div, "class", "person-card svelte-1euvdvc");
    			add_location(div, file$4, 84, 8, 2310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, h4);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t4);
    			append_dev(div, p0);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(div, t10);
    			append_dev(div, p2);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			append_dev(div, t13);
    			append_dev(div, p3);
    			append_dev(p3, strong);
    			append_dev(strong, t14);
    			append_dev(strong, t15);
    			append_dev(div, t16);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*people*/ 1 && t0_value !== (t0_value = /*person*/ ctx[13].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*people*/ 1) {
    				each_value_1 = /*person*/ ctx[13].itemsOrdered;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*people*/ 1 && t6_value !== (t6_value = (/*person*/ ctx[13].total - (/*person*/ ctx[13].percentageOfTip + /*person*/ ctx[13].percentageOfSalesTax)).toFixed(2) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*people*/ 1 && t9_value !== (t9_value = /*person*/ ctx[13].percentageOfSalesTax.toFixed(2) + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*people*/ 1 && t12_value !== (t12_value = /*person*/ ctx[13].percentageOfTip.toFixed(2) + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*people*/ 1 && t15_value !== (t15_value = /*person*/ ctx[13].total.toFixed(2) + "")) set_data_dev(t15, t15_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(84:6) {#each people as person}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*fullyCalculated*/ ctx[3] === false) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "show-results svelte-1euvdvc");
    			add_location(div, file$4, 61, 0, 1718);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Results', slots, []);
    	let { itemsArray } = $$props;
    	let { people } = $$props;
    	let salesTax;
    	let tip;
    	let fullTotal;
    	let fullyCalculated = false;

    	const iterateFunction = () => {
    		people.forEach(person => {
    			let id = person.id;

    			itemsArray.forEach(item => {
    				let peopleWhoAteID = item.peopleWhoAteIDs;

    				peopleWhoAteID.forEach(element => {
    					//   console.log(id, element[0], item);
    					if (id === element[0]) {
    						person.total += parseFloat(item.itemAmount) * item.quantity / item.peopleWhoAteIDs.length;

    						person.itemsOrdered.push([
    							item.itemName,
    							item.itemAmount,
    							item.quantity.toFixed(3) / item.peopleWhoAteIDs.length
    						]);
    					}
    				});
    			}); // console.log(person, item);
    		});

    		console.log(people);
    	};

    	let subtotal = 0;

    	const calculatesubtotal = () => {
    		itemsArray.forEach(item => {
    			subtotal += parseFloat(item.itemAmount) * item.quantity;
    		});

    		console.log(subtotal);
    	};

    	const calculatePercentageTotal = () => {
    		people.forEach(person => {
    			person.percentageOfTotal = person.total / subtotal;
    			person.percentageOfSalesTax = person.percentageOfTotal * salesTax;
    			person.percentageOfTip = person.percentageOfTotal * tip;
    			person.total += person.percentageOfTip + person.percentageOfSalesTax;
    		});
    	};

    	// handle submit button which adds sales tax and tip amount and pushed to firebase
    	const handleSubmitButton = () => {
    		$$invalidate(3, fullyCalculated = true);
    		iterateFunction();
    		calculatesubtotal();
    		calculatePercentageTotal();
    		fullTotal = subtotal + tip + salesTax;
    	};

    	const writable_props = ['itemsArray', 'people'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Results> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		salesTax = to_number(this.value);
    		$$invalidate(1, salesTax);
    	}

    	function input1_input_handler() {
    		tip = to_number(this.value);
    		$$invalidate(2, tip);
    	}

    	$$self.$$set = $$props => {
    		if ('itemsArray' in $$props) $$invalidate(5, itemsArray = $$props.itemsArray);
    		if ('people' in $$props) $$invalidate(0, people = $$props.people);
    	};

    	$$self.$capture_state = () => ({
    		itemsArray,
    		people,
    		salesTax,
    		tip,
    		fullTotal,
    		fullyCalculated,
    		iterateFunction,
    		subtotal,
    		calculatesubtotal,
    		calculatePercentageTotal,
    		handleSubmitButton
    	});

    	$$self.$inject_state = $$props => {
    		if ('itemsArray' in $$props) $$invalidate(5, itemsArray = $$props.itemsArray);
    		if ('people' in $$props) $$invalidate(0, people = $$props.people);
    		if ('salesTax' in $$props) $$invalidate(1, salesTax = $$props.salesTax);
    		if ('tip' in $$props) $$invalidate(2, tip = $$props.tip);
    		if ('fullTotal' in $$props) fullTotal = $$props.fullTotal;
    		if ('fullyCalculated' in $$props) $$invalidate(3, fullyCalculated = $$props.fullyCalculated);
    		if ('subtotal' in $$props) subtotal = $$props.subtotal;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		people,
    		salesTax,
    		tip,
    		fullyCalculated,
    		handleSubmitButton,
    		itemsArray,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Results extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { itemsArray: 5, people: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Results",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemsArray*/ ctx[5] === undefined && !('itemsArray' in props)) {
    			console_1.warn("<Results> was created without expected prop 'itemsArray'");
    		}

    		if (/*people*/ ctx[0] === undefined && !('people' in props)) {
    			console_1.warn("<Results> was created without expected prop 'people'");
    		}
    	}

    	get itemsArray() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemsArray(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get people() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set people(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.43.0 */

    const file$3 = "src/components/Footer.svelte";

    function create_fragment$3(ctx) {
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "Copyright 2021 @mlichtenberger";
    			attr_dev(div, "class", "copyright svelte-6xwcu5");
    			add_location(div, file$3, 3, 2, 30);
    			attr_dev(footer, "class", "svelte-6xwcu5");
    			add_location(footer, file$3, 2, 0, 19);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.43.0 */

    const file$2 = "src/components/Header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Checkbreaker App";
    			attr_dev(h1, "class", "svelte-1qpfx6u");
    			add_location(h1, file$2, 4, 2, 31);
    			attr_dev(header, "class", "svelte-1qpfx6u");
    			add_location(header, file$2, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/shared/Tabs.svelte generated by Svelte v3.43.0 */

    const file$1 = "src/shared/Tabs.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (8:4) {#each items as item}
    function create_each_block(ctx) {
    	let li;
    	let div;
    	let t0_value = /*item*/ ctx[2] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-5x3czw");
    			toggle_class(div, "active", /*item*/ ctx[2] === /*activeItem*/ ctx[1]);
    			add_location(div, file$1, 9, 8, 136);
    			attr_dev(li, "class", "svelte-5x3czw");
    			add_location(li, file$1, 8, 6, 123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[2] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items, activeItem*/ 3) {
    				toggle_class(div, "active", /*item*/ ctx[2] === /*activeItem*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-5x3czw");
    			add_location(ul, file$1, 6, 2, 86);
    			attr_dev(div, "class", "tabs svelte-5x3czw");
    			add_location(div, file$1, 5, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, activeItem*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, []);
    	let { items } = $$props;
    	let { activeItem } = $$props;
    	const writable_props = ['items', 'activeItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	$$self.$capture_state = () => ({ items, activeItem });

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(1, activeItem = $$props.activeItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, activeItem];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { items: 0, activeItem: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !('items' in props)) {
    			console.warn("<Tabs> was created without expected prop 'items'");
    		}

    		if (/*activeItem*/ ctx[1] === undefined && !('activeItem' in props)) {
    			console.warn("<Tabs> was created without expected prop 'activeItem'");
    		}
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItem() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItem(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.0 */
    const file = "src/App.svelte";

    // (40:37) 
    function create_if_block_2(ctx) {
    	let results;
    	let current;

    	results = new Results({
    			props: {
    				itemsArray: /*itemsArray*/ ctx[2],
    				people: /*people*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(results.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(results, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const results_changes = {};
    			if (dirty & /*itemsArray*/ 4) results_changes.itemsArray = /*itemsArray*/ ctx[2];
    			if (dirty & /*people*/ 2) results_changes.people = /*people*/ ctx[1];
    			results.$set(results_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(results.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(results.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(results, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(40:37) ",
    		ctx
    	});

    	return block;
    }

    // (38:39) 
    function create_if_block_1(ctx) {
    	let additems;
    	let current;

    	additems = new AddItems({
    			props: { people: /*people*/ ctx[1] },
    			$$inline: true
    		});

    	additems.$on("gotItemsArray", /*handleItemsArray*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(additems.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(additems, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const additems_changes = {};
    			if (dirty & /*people*/ 2) additems_changes.people = /*people*/ ctx[1];
    			additems.$set(additems_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(additems.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(additems.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(additems, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(38:39) ",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if activeItem === "Add People"}
    function create_if_block(ctx) {
    	let addpeople;
    	let current;
    	addpeople = new AddPeople({ $$inline: true });
    	addpeople.$on("gotPeopleObject", /*handlePeople*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(addpeople.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addpeople, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpeople.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpeople.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addpeople, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:2) {#if activeItem === \\\"Add People\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let tabs;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });

    	tabs = new Tabs({
    			props: {
    				activeItem: /*activeItem*/ ctx[0],
    				items: /*items*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeItem*/ ctx[0] === "Add People") return 0;
    		if (/*activeItem*/ ctx[0] === "Add Items") return 1;
    		if (/*activeItem*/ ctx[0] === "Results") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 32, 0, 811);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(tabs, main, null);
    			append_dev(main, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			append_dev(main, t2);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*activeItem*/ 1) tabs_changes.activeItem = /*activeItem*/ ctx[0];
    			tabs.$set(tabs_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, t2);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(tabs);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let items = ["Add People", "Add Items", "Results"];
    	let activeItem = "Add People";
    	let people = [];
    	let receiptInfo = [];
    	let itemsArray = [];

    	const handlePeople = event => {
    		$$invalidate(1, people = event.detail);

    		// console.log(`People added ${people}`);
    		$$invalidate(0, activeItem = "Add Items");

    		return people;
    	};

    	const handleItemsArray = event => {
    		$$invalidate(2, itemsArray = event.detail);

    		// console.log(itemsArray);
    		$$invalidate(0, activeItem = "Results");

    		return itemsArray;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AddPeople,
    		AddItems,
    		Results,
    		Footer,
    		Header,
    		Tabs,
    		items,
    		activeItem,
    		people,
    		receiptInfo,
    		itemsArray,
    		handlePeople,
    		handleItemsArray
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    		if ('activeItem' in $$props) $$invalidate(0, activeItem = $$props.activeItem);
    		if ('people' in $$props) $$invalidate(1, people = $$props.people);
    		if ('receiptInfo' in $$props) receiptInfo = $$props.receiptInfo;
    		if ('itemsArray' in $$props) $$invalidate(2, itemsArray = $$props.itemsArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeItem, people, itemsArray, items, handlePeople, handleItemsArray];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
