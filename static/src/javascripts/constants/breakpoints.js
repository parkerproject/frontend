// @flow
// Ordered lists of breakpoints
// These should match those defined in:
//   1. stylesheets/_vars.scss
//   2. common/app/layout/Breakpoint.scala

export type BreakpointName =
    | 'mobile'
    | 'mobileMedium'
    | 'mobileLandscape'
    | 'phablet'
    | 'tablet'
    | 'desktop'
    | 'leftCol'
    | 'wide';

export type Breakpoint = {
    name: BreakpointName,
    isTweakpoint: boolean,
    width: number,
};

export const breakpoints: Array<Breakpoint> = [
    {
        name: 'mobile',
        isTweakpoint: false,
        width: 0,
    },
    {
        name: 'mobileMedium',
        isTweakpoint: true,
        width: 375,
    },
    {
        name: 'mobileLandscape',
        isTweakpoint: true,
        width: 480,
    },
    {
        name: 'phablet',
        isTweakpoint: true,
        width: 660,
    },
    {
        name: 'tablet',
        isTweakpoint: false,
        width: 740,
    },
    {
        name: 'desktop',
        isTweakpoint: false,
        width: 980,
    },
    {
        name: 'leftCol',
        isTweakpoint: true,
        width: 1140,
    },
    {
        name: 'wide',
        isTweakpoint: false,
        width: 1300,
    },
];
