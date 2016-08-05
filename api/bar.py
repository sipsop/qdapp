from curry import typeddict, URL, alias

BarID = alias('BarID', str)

Bar = typeddict(
    [ ('barID',             BarID)
    , ('name',              str)
    , ('images',            [URL])
    , ('desc',              str)
    , ('tags',              [str]) # irish, classy, etc
    ], name='Bar')
