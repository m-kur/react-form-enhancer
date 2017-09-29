"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var enzyme_1 = require("enzyme");
var YourName_1 = require("./YourName");
describe('sync', function () {
    test('init, change, reset', function () {
        var form = enzyme_1.mount(React.createElement(YourName_1.YourNameComponent, { defaultValues: { gently: false, yourName: 'Mitsuha', greeting: 'have' }, submitter: function () { return null; } }));
        // init
        expect(form.state().values.gently).toBeFalsy();
        expect(form.state().values.yourName).toBe('Mitsuha');
        expect(form.state().values.greeting).toBe('have');
        expect(form.find('#zero').props().checked).toBe(false);
        expect(form.find('#one').props().value).toBe('Mitsuha');
        expect(form.find('#three').props().value).toBe('have');
        // check
        form.find('#zero').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
        var state = form.state();
        expect(state.values.gently).toBeTruthy();
        expect(form.find('#zero').props().checked).toBeTruthy();
        // change
        form.find('#one').simulate('change', { target: { name: 'yourName', value: 'Taki' } });
        form.find('#three').simulate('change', { target: { name: 'greeting', value: 'hello' } });
        expect(form.state().values.yourName).toBe('Taki');
        expect(form.state().values.greeting).toBe('hello');
        expect(form.find('#one').props().value).toBe('Taki');
        expect(form.find('#three').props().value).toBe('hello');
        // reset
        form.find('#six').simulate('click');
        expect(form.state().values).toEqual({ gently: false, yourName: 'Mitsuha', greeting: 'have' });
    });
    test('validator for yourName.onChange', function () {
        var validator = function (values) {
            if (values.yourName == null || values.yourName === '') {
                return 'Please tell me your name.';
            }
            return null;
        };
        var form = enzyme_1.mount(React.createElement(YourName_1.YourNameComponent, { defaultValues: { gently: false, yourName: 'Mitsuha', greeting: 'have' }, submitter: function () { return null; }, validators: { yourName: validator } }));
        expect(form.state().errors).toEqual({});
        form.find('#one').simulate('change', { target: { name: 'yourName', value: '' } });
        expect(form.state().errors.yourName).toBe('Please tell me your name.');
        expect(form.find('#two').text()).toBe('Please tell me your name.');
        form.find('#zero').simulate('change', { target: { name: 'gently', type: 'checkbox', checked: true } });
    });
    test('submit, but error(simple string)', function () {
        var submitter = jest.fn().mockReturnValue('Sorry, can\'t submit.');
        var form = enzyme_1.mount(React.createElement(YourName_1.YourNameComponent, { defaultValues: { gently: false, yourName: 'Mitsuha', greeting: 'have' }, submitter: submitter }));
        form.find('#one').simulate('change', { target: { name: 'yourName', value: 'Taki' } });
        form.find('#three').simulate('change', { target: { name: 'greeting', value: 'bye' } });
        form.find('form').simulate('submit');
        expect(submitter.mock.calls[0][0].gently).toBeFalsy();
        expect(submitter.mock.calls[0][0].yourName).toBe('Taki');
        expect(submitter.mock.calls[0][0].greeting).toBe('bye');
        expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
        expect(form.find('#seven').text()).toBe('Sorry, can\'t submit.');
    });
});
describe('async', function () {
    test('submitter rejects', function (done) {
        var submitter = jest.fn().mockReturnValue(new Promise(function (resolve, reject) { return setTimeout(function () { return reject('Sorry, can\'t submit.'); }, 100); }));
        var inspector = function (on, name, async) {
            if (name === 'form') {
                if (on === 'async-rejected') {
                    expect(async).toBeTruthy();
                    expect(form.state().errors.form).toBe('Sorry, can\'t submit.');
                    done();
                }
                else if (on === 'async-resolved') {
                    done();
                }
            }
        };
        var form = enzyme_1.mount(React.createElement(YourName_1.YourNameComponent, { defaultValues: { gently: false, yourName: 'Mitsuha', greeting: 'have' }, submitter: submitter, inspector: inspector }));
        expect.assertions(2);
        form.find('form').simulate('submit');
    });
    test('validator rejects', function (done) {
        var validator = jest.fn().mockReturnValue(new Promise(function (resolve, reject) { return setTimeout(function () { return reject('Please tell me your name.'); }, 100); }));
        var inspector = function (on, name, async) {
            if (name === 'yourName') {
                if (on === 'async-rejected') {
                    expect(async).toBeTruthy();
                    expect(form.state().errors.yourName).toBe('Please tell me your name.');
                    done();
                }
                else if (on === 'async-resolved') {
                    done();
                }
            }
        };
        var form = enzyme_1.mount(React.createElement(YourName_1.YourNameComponent, { defaultValues: { gently: false, yourName: 'Mitsuha', greeting: 'have' }, submitter: function () { return null; }, validators: { yourName: validator }, inspector: inspector }));
        expect.assertions(2);
        form.find('#one').simulate('change', { target: { name: 'yourName', value: '' } });
    });
});
//# sourceMappingURL=formStateProviderTest.js.map