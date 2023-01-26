$(() => {

    const
        setting   = {
        
            CountColumn:100,
            CountLine:70000,
            CountMaxLoad:5000,
            CountChartSeries:10
        },
        generator = {
            
            abc(max) {
                
                let out           = '',
                abc           = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                length_stroke = Math.floor(Math.random()*max)+3;
    
                for (let i = 0; i < length_stroke; i++ ) {
        
                    out +=  abc[Math.floor(Math.random()*52)];
        
                } 
                
                return out;        
                
            },
            num(max) { return Math.floor(Math.random()*max); }
            
        },
        dataStore = {
        
            ColumnNama:["ID"],
            Data:new DevExpress.data.ArrayStore({ data: [] }),
            TotalColumn:[{ summaryType: 'count', column: 'ID' }],
            ChartSeries:[],
            CurrentLoadLine:0,
            Test:false,
            TestGenTable() {
                
                this.Test = true;
                
                for (let i = 0; i < setting.CountColumn; i++) {  
                    
                    let Name = generator.abc(10);
            
                    (this.ColumnNama).push(Name); 
                    
                    if ((generator.num(3) === 1) && ((this.TotalColumn).length < setting.CountChartSeries)) {
                        
                        (this.TotalColumn).push({ summaryType: 'sum', column: Name });
                        (this.ChartSeries).push({ valueField: Name, name:Name });
                        
                    }  
                    
                }
                for (let j = 0; j < 100; j++) { this.TestGenData(); }
                    
            },
            TestGenData() {
                
                let obj = {};
                
                for (let num in (this.ColumnNama)) {

                    obj[(this.ColumnNama)[num]] = generator.num(100);
                    
                }
                
                obj.ID = this.CurrentLoadLine;
                
                (this.Data).push([{ type: 'insert',  data: obj }]);
                
                this.CurrentLoadLine++;
                
            },
            TestGenLoad() {
            
                setTimeout(() => {
                               
                    let NextEndEL = this.CurrentLoadLine+setting.CountMaxLoad,
                        MaxEl = (NextEndEL > setting.CountLine)?(setting.CountLine-this.CurrentLoadLine):setting.CountMaxLoad;
                    
                    for (let j = 0; j < MaxEl; j++) { this.TestGenData(); }
            
                    if (this.CurrentLoadLine < setting.CountLine) { this.TestGenLoad(); }
                    
                },500);    
                
            }
               
        
        };
        
    dataStore.TestGenTable();
    
    const DataGrid = $('#gridContainer').dxDataGrid({
        
        dataSource: { store: dataStore.Data, reshapeOnPush: true },
        repaintChangesOnly: false,
        columns: dataStore.ColumnNama,
        scrolling: { rowRenderingMode: 'virtual' },
        columnAutoWidth: true,
        paging: { pageSize: 15 },
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [15, 30, 50],
            showNavigationButtons: true
        },
        showBorders: true,
        summary: { totalItems: dataStore.TotalColumn },    
        onInitialized: () => { if (dataStore.Test) { dataStore.TestGenLoad(); }  },
        onContentReady:() => { ChartPaint(); }
        
    }).dxDataGrid("instance");
    
    const ChartOptions = {
        
        dataSource: { store: [] },
        repaintChangesOnly: false,
        commonSeriesSettings: {
           type: 'fullstackedarea',
           argumentField: 'ID',
        },
        series: dataStore.ChartSeries,
        argumentAxis: {
            valueMarginsEnabled: false,
            visualRangeUpdateMode: 'keep',
        },
        legend: {
            verticalAlignment: 'bottom',
            horizontalAlignment: 'center',
        }

    };
    
    $('#chartContainer').dxChart(ChartOptions);

    function ChartPaint() {

        let page = DataGrid.pageIndex(),
            size = DataGrid.pageSize(),
            data = [];

        for (let i = page*size; i <= ((page+1)*size); i++) { data.push(dataStore.Data._array[i]); }
        
        ChartOptions.dataSource.store = data;

        $('#chartContainer').dxChart(ChartOptions);
  
    }

});
