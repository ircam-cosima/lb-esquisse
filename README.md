# Color Fields, Luciano Leite Barbosa (2018)

> web-based application for _Color Fields_ composed by Luciano Leite Barbosa - Cursus Ircam 2018

## Audio graph

```
                    master (`/volume`)
                            |
                       group-master 
                    (`/group-x/volume`)
                    /                 \
          sine-volume                granular-volume
(`/group-x/sine/volume`)          (`/group-x/sine/volume`)
                  |                      |
            sine-gain                granular-envelop
          (cf. config)           (`/group-x/granular/envelop`)
                  |
            sine-envelop 
    (`/group-x/sine/envelop`)
```
